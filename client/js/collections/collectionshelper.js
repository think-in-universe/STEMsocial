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
  let filtered = Session.get('settings').whitelist.filter(function(value, index, arr){ return value != 'steemstem';});
  let query = { language: 'en', parent_author: '', created: {$gt: stamp}, author: {$in: filtered} };
  let content = Content.find(query).fetch();
  if(content.length > Session.get('N_whitelist')) Session.set('N_whitelist', content.length);
  else return Session.get('whitelisted');

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
});

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
    // Do we have profile information
    let all_users =  User.find({}).fetch();
    if (all_users.length==0) return [];

    // Getting the last transactions
    let current_user = all_users[ all_users.length-1].name;
    if (limit) return PersonalHistory.find({user:current_user}, { limit: limit }).fetch().reverse();
    else return PersonalHistory.find({user:current_user}).fetch().reverse();
  }
});

// Get all blog posts from an author
Template.registerHelper('currentAuthorBlog', function()
{
  // Some variables
  let author  = Session.get('user');
  let to_skip = (Session.get('current-page')-1)*Session.get('blogs_per_page');

  // Get the post to show
  let content = Blog.find({from:author}, {sort:{created:-1}, skip:to_skip, limit:Session.get('visiblecontent')}).fetch();
  let last    = Blog.find({from:author}, {sort:{created:1}, limit:1}).fetch();

  // Exit
  return content;
})
