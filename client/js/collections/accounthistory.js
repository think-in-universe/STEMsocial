AccountHistory = new Mongo.Collection(null)

// Getting the list of supported posts
AccountHistory.getVotes = function(quiet=false)
{
  // Only when all steemstem-voted posts are loaded, we load the rest of the posts
  if( Session.get('last_loaded_vote_stamp') <= Session.get('loaded_week'))
  {
    if(!quiet) AccountHistory.GetContent();
    let start = new Date().getTime(); for (let i = 0; i < 1e7; i++) { if ((new Date().getTime() - start) > 2000) break; }
    if(Session.get('last_loaded_post')=='') AccountHistory.LoadTags();
    else if(Session.get('last_loaded_post').split('/')[2] > Session.get('loaded_week')) AccountHistory.LoadTags();
    return;
  }

  // Getting information on the necessary votes
  steem.api.getAccountHistory('steemstem',Session.get('last_loaded_vote'),500, (err, res)=>
  {
    if (!res) {console.log('steem API error (account history): ', err); return; }
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


// To get all posts from the steemstem tag
AccountHistory.LoadTags = function ()
{
  // 75 posts are obtained, from the current starting point (default  = last created post)
  let query = { tag: "steemstem", limit:Session.get('load_post_charge')};
  let last = Session.get('last_loaded_post');

  // Checking whether extra posts need to be laoded
  if(last!='')
  {
    if(last.split('/')[2]<Session.get('loaded_week')) return;
    query = { tag: "steemstem", limit:Session.get('load_post_charge'),
       start_author:last.split('/')[0], start_permlink:last.split('/')[1] };
  }

  // Getting the tag content
  steem.api.getDiscussionsByCreated(query, (err, res) =>
  {
    // Error
    if (!res) {console.log('Steem API error (getDiscussionsByCreated):', query, err); return err; }

    // Everything is fine
    for (let i=0; i<res.length; i++)
    {
      // Ignored voted posts, comments and posts without metadata
      if(Content.findOne({permlink:res[i].permlink}) || res[i].parent_author!='' || !res[i].json_metadata) continue;

      // SteemSTEM voted post
      let weight=0;
      if(AccountHistory.findOne({permlink:res[i].permlink}))
        weight = AccountHistory.findOne({permlink:res[i].permlink})._id.split('/')[2];

      // Normal post: updating the result and saving it
      let result = AccountHistory.UpgradeInfo(res[i],weight);
      Content.upsert({ _id: result._id }, result);
    }

    // Recursive loading
    let new_last = Content.findOne({permlink:res[res.length-1].permlink});
    Session.set('last_loaded_post',new_last.author+'/'+new_last.permlink+'/'+ new_last.week);
    let start=new Date().getTime(); for (let i=0; i<1e7; i++) { if ((new Date().getTime()-start) > 2000) break; }
    AccountHistory.getVotes(true);

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
    AccountHistory.GetInfo(author, permlink, weight);
    timer--;
  }
  return;
}


// Getting post information on a voted content
AccountHistory.GetInfo= function(author, permlink, weight)
{
  // Interrogating Steem
  steem.api.getContent(author, permlink, function (error, result)
  {
    // If error, comment or no metadata -> ignore
    if (!result || result.parent_author!='' || !result.json_metadata) { return; }

    // Else: upgrade and save the information
    let res = AccountHistory.UpgradeInfo(result, weight);
    Content.upsert({ _id: res._id }, res);

    // exit
    return;
  });
}


// Getting more information on a post to save in the memory
AccountHistory.UpgradeInfo = function (post, weight)
{
  // metadata
  try { post.json_metadata = JSON.parse(post.json_metadata) } catch (error) { }
  post.search = ''

  // Tags and language
  if('tags' in post.json_metadata)
  {
    if(!Array.isArray(post.json_metadata.tags)) post.json_metadata.tags = [post.json_metadata.tags]
    post.search = post.json_metadata.tags.join(' ')
    for (let t = 0; t < post.json_metadata.tags.length; t++)
    {
      if (!post.language) { post.language = FilterLanguage(post.json_metadata.tags[t]) }
      else { break; }
    }
  }
  if (!post.language) { post.language = 'en' }

  // Week of the post
  post.week = Blaze._globalHelpers['Timestamp'](post.created);

  // Setting useful information
  post.surl = Content.CreateUrl(post.author, post.permlink)
  if(weight>0 || (Session.get('settings') && Session.get('settings').whitelist.includes(post.author)) )
     { post.type = 'steemstem' }
  else { post.type = 'all' }
  post.upvoted = parseInt(weight);
  post._id = post.id

  // Exit
  return post
}


// Get the langage of a post
FilterLanguage = function (tag)
{
  let langs = Session.get('settings').languages
  if (tag != 'steemstem')
  {
    for (var key in langs)
      if (langs.hasOwnProperty(key))
        if (Session.get('settings').languages[key].includes(tag)) { return key }
  }
}
