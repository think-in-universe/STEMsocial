AccountHistory = new Mongo.Collection(null)

// New method to get the list of supported posts
AccountHistory.getVotes = function()
{
  // Only when all steemstem-voted posts are loaded, we load the rest of the posts
  if( Session.get('last_loaded_vote_stamp') <= Session.get('loaded_week')) { AccountHistory.TagLoad(); return; }

  // Getting information on the necessary votes
  steem.api.getAccountHistory('steemstem',Session.get('last_loaded_vote'),500, function(error, result)
  {
    if (!result) {console.log('error with account history: ', error); return; }

    let unset=true;
    for (i = 0; result.length > i; i++)
    {
      if (result[i][1].op[1].voter == 'steemstem' && result[i][1].op[0] === "vote")
      {
        // permlink, weight and duplicate check
        if(result[i][1].op[1].author=='lemouth-dev') continue;
        let id = result[i][1].op[1].author+'/'+result[i][1].op[1].permlink+'/'+result[i][1].op[1].weight/100;
        if(AccountHistory.findOne({_id:id})) { continue; }

        // Saving
        AccountHistory.insert({_id:id}); AccountHistory.GetInfo(id);

        // For the recursive load, we need to save the last timestamp
        if(unset)
        {
          unset=false;
          // Timestamp
          let vote_time = new Date(result[i][1].timestamp)
          let nDay = (vote_time.getDay() + 6) % 7; vote_time.setDate(vote_time.getDate() - nDay + 3);
          let n1stThursday = vote_time.valueOf(); vote_time.setMonth(0, 1);
          if (vote_time.getDay() !== 4) { vote_time.setMonth(0, 1 + ((4 - vote_time.getDay()) + 7) % 7); }
          let vote_week = 1 + Math.ceil((n1stThursday - vote_time) / 604800000);
          let vote_stamp = vote_week + 100*(vote_time.getFullYear()-2000);
          Session.set('last_loaded_vote',      result[i][0]-1)
          Session.set('last_loaded_vote_stamp',vote_stamp)
        }
      }
    }
    if(unset) { Session.set('last_loaded_vote',      result[0][0]-1) }

    // Continuing browsing the blockchain until the time limit is passed
    AccountHistory.getVotes()
  });
  return;
}


// To get all posts from the steemstem tag
AccountHistory.TagLoad = function ()
{
  // 75 posts are obtained, from the current starting point (default  = last cerated post)
  let query = { tag: "steemstem", limit:75};
  let last = Session.get('last_loaded_post');

  // Checking whether extra posts need to be laoded
  if(last!='')
  {
    if(last.split('/')[2]<Session.get('loaded_week')) {return;}
    query = { tag: "steemstem", limit:75, start_author:last.split('/')[0], start_permlink:last.split('/')[1] };
  }

  // Interrogating Steem
  steem.api.getDiscussionsByCreated(query, function(error, result)
  {
    if (!result) {console.log('error query', query, error); return error; }
    for (let i = 0; i < result.length; i++)
    {
      // Voted posts
      if(Content.findOne({permlink:result[i].permlink})) continue;
      // Ignore comments
      if(result[i].parent_author!='') { return }
      // Ignore if no metadata
      if (!result[i].json_metadata) { return }
      // Normal post: updating the result and saving it
      result[i] = AccountHistory.UpgradeInfo(result[i],0);
      Content.upsert({ _id: result[i]._id }, result[i])
    }
    // Recursive loading
    Session.set('last_loaded_post', result[result.length-1].author+'/'+result[result.length-1].permlink+'/' +
      result[result.length-1].week)
    AccountHistory.TagLoad();
  });
}


// Getting post information on a voted content
AccountHistory.GetInfo= function(perm)
{
  // Basic info
  let author = perm.split('/')[0]
  let permlink = perm.split('/')[1]
  let weight = perm.split('/')[2]

  // Interrogating Steem
  steem.api.getContent(author, permlink, function (error, result)
  {
    // If error -> ignore
    if (!result) { return; }

    // Ignore comments
    if(result.parent_author!='') { return; }
    // Ignore if no metadata
    if (!result.json_metadata) { return; }

    // Else: upgrade and save the information
    result = AccountHistory.UpgradeInfo(result, weight);
    Content.upsert({ _id: result._id }, result)
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
  let d=new Date(post.created);
  let nDay = (d.getDay() + 6) % 7; d.setDate(d.getDate() - nDay + 3);
  let n1stThursday = d.valueOf(); d.setMonth(0, 1);
  if (d.getDay() !== 4) { d.setMonth(0, 1 + ((4 - d.getDay()) + 7) % 7); }
  let week = 1 + Math.ceil((n1stThursday - d) / 604800000);
  let year = d.getFullYear();
  post.week = week+100*(year-2000)

  // Setting useful information
  post.surl = Content.CreateUrl(post.author, post.permlink)
  if(weight>0 || (Session.get('settings') && Session.get('settings').whitelist.includes(post.author)) ) { post.type = 'steemstem' }
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
