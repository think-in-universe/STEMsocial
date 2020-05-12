AccountHistory = new Mongo.Collection(null)


// Getting the list of supported posts
AccountHistory.getVotes = function(quiet=false)
{
  // Only when all STEMsocial-voted posts are loaded, we load the rest of the posts
  if( Session.get('last_loaded_vote_stamp') <= Session.get('loaded_week'))
  {
    if(!quiet) AccountHistory.GetContent();
    return;
  }

  // Getting information on the necessary votes
  hive.api.getAccountHistory('steemstem',Session.get('last_loaded_vote'),500, (err, res)=>
  {
    if (!res) {console.log('Hive API error (account history): ', err); return; }
    if(res.length==0) {return;}

    // Updating the settings related to the loaded votes
    Session.set('last_loaded_vote', res[0][0]-1);
    Session.set('last_loaded_vote_stamp', Blaze._globalHelpers['Timestamp'](res[0][1].timestamp));
    for (let i=0; i<res.length; i++)
    {
      if (res[i][1].op[0] != "vote" || res[i][1].op[1].voter!='steemstem') continue;

      // permlink, weight and duplicate check
      let id = res[i][1].op[1].author+'/'+res[i][1].op[1].permlink+'/'+res[i][1].op[1].weight/100;
      if(AccountHistory.findOne({_id:id})) continue;

      // Saving
      AccountHistory.insert({_id:id, timestamp:res[i][1].timestamp, permlink:res[i][1].op[1].permlink});
    }

    // Continuing browsing the blockchain until the time limit is passed
    AccountHistory.getVotes()
  });
  return;
}


// To get all posts from the STEMsocial community and any given tag
AccountHistory.LoadTags = function (tag_id=0)
{
  // Tag and end of the loop
  let tag = JSON.parse(Session.get('main_tags'));
  if(tag_id==tag.length) return;

  // A set of posts is obtained, from the current starting point (default  = last created post)
  tag = tag[tag_id];
  let query = { tag:tag, limit:Session.get('load_post_charge')};
  let last = JSON.parse(Session.get('last_loaded_post'));

  // Checking whether extra posts need to be laoded
  if(last[tag_id])
  {
    if(last[tag_id].week<Session.get('current_week')-1) return AccountHistory.LoadTags(tag_id+1);
    query = { tag:tag, limit:Session.get('load_post_charge'),
      start_author:last[tag_id].author, start_permlink:last[tag_id].permlink };
  }

  // Getting the tag content
  hive.api.getDiscussionsByCreated(query, (err, res) =>
  {
    // Error
    if (!res) {console.log('Hive API error (getDiscussionsByCreated):', query, err); return err; }

    // Everything is fine
    for (let i=0; i<res.length; i++)
    {
      // Ignored voted posts, comments and posts without metadata
      if(Content.findOne({permlink:res[i].permlink}) || res[i].parent_author!='' || !res[i].json_metadata) continue;

      // STEMsocial voted post
      let weight=0;
      if(AccountHistory.findOne({permlink:res[i].permlink}))
        weight = AccountHistory.findOne({permlink:res[i].permlink})._id.split('/')[2];

      // Normal post: updating the result and saving it
      let result = AccountHistory.UpgradeInfo(res[i],weight);
      Content.upsert({ _id: result._id }, result);
    }

    // Saving info about the last inserted post
    last_post = Content.findOne({permlink:res[res.length-1].permlink});
    last[tag_id] = {author:last_post.author, permlink:last_post.permlink, week:last_post.week};
    Session.set('last_loaded_post',JSON.stringify(last));

    // Recursive loading
    let stem_posts = Content.find({author:{$nin: ['steemstem','lemouth-dev']}, upvoted:{$gt: 0}},
       {sort:{created:1}, limit:1}).fetch();
    let other_posts     = Content.find({upvoted:0}, {sort:{created:1}, limit:1}).fetch();

    if(stem_posts[0].created<other_posts[0].created)
    {
      let start=new Date().getTime(); for (let i=0; i<1e7; i++) { if ((new Date().getTime()-start) > 2000) break; }
      AccountHistory.LoadTags(tag_id);
    }

    // Exit
    return;
  });
}


// Get content
AccountHistory.GetContent = function(total=20)
{
  let posts = AccountHistory.find({},{sort:{timestamp:-1}}).fetch();
  let timer = total;
  for (let i=0; i<posts.length && timer>0; i++)
  {
    // Post basics
    let author   = posts[i]._id.split('/')[0];
    let permlink = posts[i]._id.split('/')[1];
    let weight   = posts[i]._id.split('/')[2];

    // Skipping comments and content already obtained
    if(parseFloat(weight)<5 || Content.find({permlink:permlink}).fetch().length>0) continue;

    // Get information on the post
    if(timer==1) AccountHistory.GetInfo(author, permlink, weight,true);
    else         AccountHistory.GetInfo(author, permlink, weight);
    timer--;
  }

  return;
}


// Getting post information on a voted content
AccountHistory.GetInfo= function(author, permlink, weight, update_tag=false)
{
  // Interrogating Hive
  hive.api.getContent(author, permlink, function (error, result)
  {
    // If error, comment or no metadata -> ignore
    if (!result || result.parent_author!='' || !result.json_metadata) { return; }

    // Else: upgrade and save the information
    let res = AccountHistory.UpgradeInfo(result, weight);
    Content.upsert({ _id: res._id }, res);

    // Do we need to update the tag?
    if(update_tag)
    {
      let tag_posts = Content.find({upvoted:0}, {sort: {created:1}, limit:1}).fetch();
      if(tag_posts.length==0 || res.created<tag_posts[0].created) AccountHistory.LoadTags();
    }

    // exit
    return;
  });
}


// Getting more information on a post to save in the memory
AccountHistory.UpgradeInfo = function (post, weight)
{
  // metadata
  try { post.json_metadata = JSON.parse(post.json_metadata.replace('\"','"')); } catch (error) { }
  post.search = ''

  // Tags and language
  if(post.json_metadata['tags'])
  {
    if(!Array.isArray(post.json_metadata.tags)) post.json_metadata.tags = [post.json_metadata.tags]
    post.search = post.json_metadata.tags.join(' ')
    for (let t = 0; t < post.json_metadata.tags.length; t++)
    {
      if(Session.get('allowed_tags').includes(post.json_metadata.tags[t])) continue;
      if(!post.language) { post.language = FilterLanguage(post.json_metadata.tags[t]) }
      else { break; }
    }
  }
  if (!post.language) { post.language = 'en' }

  // Week of the post
  post.week = Blaze._globalHelpers['Timestamp'](post.created);

  // Setting useful information
  post.surl = Content.CreateUrl(post.author, post.permlink)
  if(weight>0 || (Session.get('settings') && Session.get('settings').whitelist.includes(post.author)) )
     { post.type = 'stemsocial' }
  else { post.type = 'all' }
  post.upvoted = parseInt(weight);
  post._id = post.id

  // Exit
  return post
}


// Get the langage of a post
FilterLanguage = function(tag)
{
  for (var key in Session.get('settings').languages) if (Session.get('settings').languages[key].includes(tag.toLowerCase())) return key;
}
