// New main function to get the list of new steemstem posts
Template.registerHelper('NewSteemSTEMContent', function (loaded_week)
{
  // Define the query according to the needs
  let query = { language: Session.get('lang'), parent_author: "", week:loaded_week };
  if (Session.get('currentSearch'))
    query["json_metadata.tags"] = new RegExp('.*' + Session.get('currentSearch'), 'i');
  if (!Session.get('unfiltered')) { query.type = 'steemstem'; }
  if(Session.get('superfilter')=='medium') { query.upvoted = {$gte:20}; }
  if(Session.get('superfilter')=='top')    { query.upvoted = {$gte:65}; }

  // Send the query and get the output
  return Content.find(query, { sort: {created:-1,upvoted:-1}, limit:Session.get('visiblecontent')}).fetch();
});


// Main function to randomly get N votable posts made by the whitelisted authors
Template.registerHelper('whitelistedContent', function ()
{
  // If no or not enough content -> return
  if (!Content.find().fetch()) return;

  // Time stamp and  number of posts to return
  let N = 3;
  let stamp = new Date(); stamp.setDate(stamp.getDate() - 7);
  stamp = stamp.toISOString().slice(0, 19);

  // Get the whitelisted content opf the last week
  let query = { language: 'en', parent_author: '', created: {$gt: stamp},
    author: {$in: Session.get('settings').whitelist} };
  let content = Content.find(query).fetch();
  if(content.length > Session.get('N_whitelist'))
    { Session.set('N_whitelist', content.length) }
  else
    { return Session.get('whitelisted'); }

  // Select N posts amongst it
  if(content.length<=N) { Session.set('whitelisted', content); return content; }

  let selected = [];
  while(selected.length<N)
  {
    let item = content[Math.floor(Math.random()*content.length)];
    if(!selected.includes(item)) selected.push(item);
  }
  Session.set('whitelisted', selected);
  return selected;
});


// Main fuction to get a loist of suggestions of posts written by a given author
Template.registerHelper('currentSuggestions', function () {
  return Content.find({ type:'blog', author:Session.get('user') }, { sort: { active_votes: -1 }, limit: 3 }).fetch()
})


// Main function to get a specific article
Template.registerHelper('currentArticle', function () {
    if (Content.findOne({ 'permlink': Session.get('article') }))
      { return Content.findOne({ 'permlink': Session.get('article') }) }
})


// Get information on a specific author
Template.registerHelper('currentAuthor', function () {
  if (User.findOne({ name: Session.get('user') })) { return User.findOne({ name: Session.get('user') }) }
})

// Getting the list of comments to an article
Template.registerHelper('currentArticleComments', function ()
{
  if(Comments.find({ 'parent_permlink': Session.get('article') }).fetch())
  {
        comments=Comments.find({'parent_permlink': Session.get('article') }).fetch()
        comments.sort(function(a,b) {
          var wa1 = parseInt(a.vote_rshares)
          var wb1 = parseInt(b.vote_rshares)
          weight_1 = wa1 > wb1 ? -1 : wa1 < wb1 ? 1 : 0
          wa1 = parseInt(a.net_votes)
          wb1 = parseInt(b.net_votes)
          weight_2 = wa1 > wb1 ? -1 : wa1 < wb1 ? 1 : 0
          wa1 = new Date(a.created).getTime();
          wb1 = new Date(b.created).getTime();
          weight_3 = wa1 > wb1 ? -1 : wa1 < wb1 ? 1 : 0
          weight = weight_1+weight_2
          return weight<0 ? -1 : weight>0 ? 1 : weight_3
        });
        return comments
  }
})

// Getting the replies to a comment
Template.registerHelper('currentCommentsSubcomments', function (comment) {
  if (Comments.find({ 'parent_permlink': comment.permlink }).fetch())
    { return Comments.find({ 'parent_permlink': comment.permlink }).fetch() }
})


// Get the list of followers to a given author
Template.registerHelper('currentAuthorFollowers', function (comment) {
  if (Comments.find({ 'parent_permlink': comment.permlink }).fetch())
    { return Comments.find({ 'parent_permlink': comment.permlink }).fetch() }
})


// Get the history associated with a given author
Template.registerHelper('currentAuthorHistory', function (limit) {
  if (PersonalHistory.find().fetch())
  {
    if (limit)
      return PersonalHistory.find({}, { limit: limit }).fetch().reverse()
    else
      return PersonalHistory.find().fetch().reverse()
  }
})

// Get all blog posts from an author
Template.registerHelper('currentAuthorBlog', function (stop=0) {
  var author  = Session.get('user');
  var lim     = Session.get('visiblecontent');
  var content = Blog.find({from:author}, {sort:{created:-1}, skip:stop, limit:lim}).fetch();
  var last    = Blog.find({from:author}, {sort:{created:1}, limit:1}).fetch()
  if((stop+content.length)==Blog.find({from:author}).fetch().length && Session.get('Query-done'))
    Session.set('more-blogs',false)
  if(content.length<lim && last.length>0)
  {
    if(Session.get('Queried')!=last[0].permlink && !Session.get('Query-done'))
    {
      Blog.getContentByBlog(author,51,'blog',function(error){if(error) {console.log(error)}},
        last[0].permlink, last[0].author);
      Session.set('Queried', last[0].permlink)
    }
  }
  return content;
})
