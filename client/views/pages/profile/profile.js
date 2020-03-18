// Page rendering
Template.profile.rendered = function () {
  $('.menu.profile .item').tab()
  if (Session.get('currentprofiletab')) {
    var tabmenu = Session.get('currentprofiletab');
    switch (tabmenu) {
      case 'blog':
        $('.menu.profile .item').tab('change tab', 'first')
        FlowRouter.go('/@' + Session.get('user'))
        break;
      case 'comments':
        $('.menu.profile .item').tab('change tab', 'second')
        break;
      case 'replies':
        $('.menu.profile .item').tab('change tab', 'tirdh')
        break;
      case 'rewards':
        $('.menu.profile .item').tab('change tab', 'fourth')
        break;
      case 'wallet':
        $('.menu.profile .item').tab('change tab', 'fifth')
        break;
      default:
        $('.menu.profile .item').tab('change tab', 'first')
    }
  }
  Session.set('visiblecontent',1)
  $('.ui.blog.bottom')
  .visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function () {
      Session.set('visiblecontent', Math.min(Session.get('visiblecontent') + 25,76))
    }
  })
}


// Helpers
Template.profile.helpers({
  // Get the number of posts to skip in an author blog
  ToPass: function() { return Session.get('ToPass'); },

  // Get the number of pages for the user blog
  GetToPass: function()
  {
    max = Session.get('MaxToPass')
    if(max==0) { return [] }
    return Array.from({length: 1+max/76}, (v, k) => k+1)
  },

  // Is it the current page?
  MyPage: function()
  {
    if((this.valueOf()-1)==Session.get('ToPass')/76) { return true }
    else { return false}
  },

  //Testing whether the user blog is fully loaded
  NotFullBlogLoaded: function()
   { return Session.get('more-blogs'); }
})


// Clickable buttons
Template.profile.events({
  // Go to the list of blog posts
  'click #blog': function (event) {
    event.preventDefault()
    FlowRouter.go('/@' + Session.get('user'))
  },

  // Go to the list of comments
  'click #comments': function (event) {
    event.preventDefault()
    FlowRouter.go('/@' + Session.get('user') + '/comments')
  },

  // Go to the list of replies
  'click #replies': function (event) {
    event.preventDefault()
    FlowRouter.go('/@' + Session.get('user') + '/replies')
  },

  // Go to the reward lists
  'click #rewards': function (event) {
    event.preventDefault()
    FlowRouter.go('/@' + Session.get('user') + '/rewards')
  },

  // Go to the wallet
  'click #wallet': function (event) {
    event.preventDefault()
    FlowRouter.go('/@' + Session.get('user') + '/wallet')
  },

  // Loadin a new page og blog posts
  'click #load-more': function(event) {
    Session.set('MaxToPass', Session.get('MaxToPass')+76)
    Session.set('ToPass', Session.get('ToPass')+76)
    Session.set('visiblecontent',1)
    $('html,body').scrollTop(0);
  },

  // Navigation between pages of blog posts
  'click .go-to': function(event) {
    Session.set('MaxToPass', Math.max(Session.get('MaxToPass'), Session.get('ToPass')))
    Session.set('ToPass', (this.valueOf()-1)*76)
    Session.set('visiblecontent',1)
    $('html,body').scrollTop(0);
  }

})
