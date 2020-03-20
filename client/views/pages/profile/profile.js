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
  Session.set('visiblecontent',5)
  $('.ui.blog.bottom')
  .visibility({
    once: false,
    observeChanges: true,
    onBottomVisible: function ()
    {
      Session.set('visiblecontent', Math.min(Session.get('blogs_per_page'),
        Session.get('visiblecontent') + Session.get('visiblecontentlimit')));
    }
  })
}


// Helpers
Template.profile.helpers({
  // Empty blog
  EmptyBlog: function(author)
  {
    if(Session.get('blog_loaded') && Blog.find({from:author}).fetch().length==0) return true;
    else return false;
  },

  // Is Blog Loaded
  NotBlogLoaded: function(author)
  {
    if(Blog.find({from:author}).fetch().length==0 || Session.get('blog_loaded')) return false;
    else return true;
  },

  // Get the number of blog pages to display
  BlogToLoad: function(author)
  {
    nblogs = Blog.find({from:author}).fetch().length;
    if(nblogs<=Session.get('blogs_per_page')) return [];
    return Array.from({length: Math.ceil(nblogs/Session.get('blogs_per_page'))}, (v, k) => k+1);
  },

  // Is it the current page?
  MyPage: function()
  {
    if( this.valueOf()==Session.get('current-page')) return true;
    else { return false;}
  }
});


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
  'click .load-more': function(event) {
    Session.set('visiblecontent',Session.get('visiblecontentlimit'));
    Blog.UpdateBlog(-1);
  },

  // Navigation between pages of blog posts
  'click .go-to-page': function(event)
  {
    Session.set('visiblecontent',Session.get('visiblecontentlimit'));
    Session.set('current-page', parseInt(this));
    $('html,body').scrollTop(0);
    Blog.UpdateBlog(parseInt(this));
 }

})
