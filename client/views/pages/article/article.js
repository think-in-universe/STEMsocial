// Rendering
Template.article.rendered = function () {
  // Post rendering
  $('article').visibility(
  {
    once: false,
    // update size when new content loads
    observeChanges: true,
    // load content on bottom edge visible
    onBottomVisible: function ()
    {
      // loads a max of 5 times 
      if(!Comments.findOne({ 'parent_permlink': Session.get('article') }))
        Comments.loadComments(Session.get('user'), Session.get('article'));
    }
  });

  // Do we have a comment to post?
  if(localStorage.connect_command) HiveConnect(JSON.parse(localStorage.connect_command), function() {});

}

// Set of helper methods to be used in the HTML document
Template.article.helpers({});


// Post edition: definition of the buttons
Template.article.events({});

