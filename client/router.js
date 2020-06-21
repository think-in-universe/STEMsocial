import { Template } from "meteor/templating";
import { Session } from "meteor/session";

// Main route
FlowRouter.route('/', {
  name: 'home',
  action: function (params, queryParams) {
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "home", topmenu: "topmenu" });
      $('.actived').removeClass('actived');
      $('.stemsocial.home').addClass('actived');
      Session.set('currentFilter', false);
      Session.set('currentSearch', false);
      Session.set('currentTag', false);
      Session.set('superfilter','');
  }
});


// Admin panel
FlowRouter.route('/admin', {
    name: 'admin',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "admin", topmenu: "topmenu" });
    }
});


// FAQ
FlowRouter.route('/faq', {
    name: 'faq',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "faq", topmenu: "topmenu" });
    }
});


// TOS
FlowRouter.route('/tos', {
    name: 'tos',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "tos", topmenu: "topmenu" });
    }
});

FlowRouter.route('/aboutus', {
    name: 'aboutus',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "aboutus", topmenu: "topmenu" });
    }
});

// Post creation
FlowRouter.route('/create',
{
  name: 'create',
  action: function (params, queryParams)
  {
    DocHead.removeDocHeadAddedTags()
    Session.set('preview-title','')
    Session.set('preview-body','')
    Session.set('preview-beneficiaries','')
    BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "create", topmenu: "topmenu" });
  }
});

FlowRouter.route('/edit/@:user/:permlink',
{
  name: 'edit',
  action: function (params, queryParams)
  {
    if(localStorage.username==params.user)
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "create", topmenu: "topmenu" });
    else
        FlowRouter.go('/@' + params.user + '/' + params.permlink)
  }
});

// Login to the app via HiveSigner + redirection to the previous page if needed
FlowRouter.route('/login', {
    name: 'login',
    action: function (params, queryParams) {
        // Setting the token information
        localStorage.setItem('accesstoken', queryParams.access_token);  sc2.setAccessToken(localStorage.accesstoken);
        localStorage.setItem('username', queryParams.username);
        let time = new Date(); time = new Date(time.getTime() + 1000 * (parseInt(queryParams.expires_in) - 10000));
        localStorage.setItem('expires_at', time);
        FlowRouter.setQueryParams({ params: null, queryParams: null });

        // Checking whether a command has to be submitted
        if(localStorage.connect_command) { FlowRouter.go(localStorage.connect_route); return; }
    }
});


// Getting all blog posts written by a user
FlowRouter.route('/@:user',
{
  name: 'profile',
  action: function (params, queryParams) {
    DocHead.removeDocHeadAddedTags();
    BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
    Session.set('user', params.user);
    Session.set('currentprofiletab','blog');

    // User to process
    User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

    // Get the user account history
    if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

    // Blog posts
    Session.set('visiblecontent', 5);
    Session.set('blog_loaded',    false);
    Session.set('current-page',   1);
    Blog.getContentByBlog(params.user, 2*Session.get('blogs_per_page'), 'blog');

    // tab
    $('.menu.profile .item').tab('change tab', 'first');
  }
});
FlowRouter.route('//@:user', {action: function(params, queryParams) { FlowRouter.go('/@'+params.user) }});



// Getting all comments made by a user
FlowRouter.route('/@:user/comments', {
    name: 'profile',
    action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags()
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
      Session.set('user', params.user)
      Session.set('currentprofiletab','comments')

      // User to process
      User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

      // Get the user account history
      if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

      // tab
      $('.menu.profile .item').tab('change tab', 'second');
    }
});
FlowRouter.route('//@:user/comments', {action: function(params, queryParams) { FlowRouter.go('/@'+params.user+'/comments') }});


// Getting all replies made by a user
FlowRouter.route('/@:user/replies', {
    name: 'profile',
    action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags()
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
      Session.set('user', params.user)
      Session.set('currentprofiletab','replies')

      // User to process
      User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

      // Get the user account history
      if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

      // tab
      $('.menu.profile .item').tab('change tab', 'third');
    }
});
FlowRouter.route('//@:user/replies', {action: function(params, queryParams) { FlowRouter.go('/@'+params.user+'/replies') }});


// Getting all rewards got by a user
FlowRouter.route('/@:user/rewards', {
    name: 'profile',
    action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags()
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
      Session.set('user', params.user)
      Session.set('currentprofiletab','rewards')
      // User to process
      User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

      // Get the user account history
      if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

      // tab
      $('.menu.profile .item').tab('change tab', 'fourth')
    }
});
FlowRouter.route('//@:user/rewards', {action: function(params, queryParams) { FlowRouter.go('/@'+params.user+'/rewards') }});


// Access to a user wallet
FlowRouter.route('/@:user/wallet', {
    name: 'profile',
    action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags()
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
      Session.set('user', params.user)
      Session.set('currentprofiletab','wallet')

      // User to process
      User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

      // Get the user account history
      if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

      // tab
      $('.menu.profile .item').tab('change tab', 'fifth')
    }
});
FlowRouter.route('//@:user/wallet', {action: function(params, queryParams) { FlowRouter.go('/@'+params.user+'/wallet') }});


// Getting all posts from one category
FlowRouter.route('/:tag', {
    name: 'tag',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "home", topmenu: "topmenu" });
        Session.set('currentSearch',params.tag)
    }
});


// Direct access to a blog post
FlowRouter.route('/@:user/:permlink', {
    name: 'project',
    action: function (params, queryParams) {
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "article", topmenu: "topmenu" });
        Session.set('visiblecontent',12)
        Session.set('user', params.user)
        Session.set('article', params.permlink)
        DocHead.removeDocHeadAddedTags()
        if (!Content.findOne({ permlink: params.permlink }))
          { Content.getContent(params.user, params.permlink,"article", function (error) { if (error) { console.log(error) } }) }
        hive.api.getContent(params.user, params.permlink, function (error, result)
        {
          if(error) {console.log('error = ', error); }
          else
          {
             var __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
             if(result.body.match(__imgRegex))
             {
               var img = 'https://images.hive.blog/0x0/' + result.body.match(__imgRegex)[0];
               DocHead.addMeta({property: 'og:image', content: img})
             }
             DocHead.addMeta({property: 'title', content: result.title})
             DocHead.addMeta({property: 'og:title', content: result.title})
             DocHead.addMeta({property: 'og:url', content: 'https://stem.openhive.network/#!'+result.url})
             desc = Blaze._globalHelpers['xssShortFormatter'](result.body)
             desc = Blaze._globalHelpers['shortDescription'](desc)
             desc = desc.split('\n').join(' ')
             DocHead.addMeta({property: 'og:description', content: desc})
             DocHead.addMeta({property: 'description', content: desc})
          }
        })

        // User to process
        User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

        // Blog posts
        Session.set('visiblecontent', 5);
        Session.set('blog_loaded',    false);
        Session.set('current-page',   1);
        Blog.getContentByBlog(params.user, 10, 'blog');

        window.scrollTo(0,0);
    }
})


//TO FIX PROBLEM WITH SEARCH 
FlowRouter.route('//@:user/:permlink', {
    name: 'project',
    action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags()
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "article", topmenu: "topmenu" });
      Session.set('user', params.user)
      Session.set('article', params.permlink)
      if (!Content.findOne({ permlink: params.permlink }))
        Content.getContent(params.user, params.permlink,"article", function (error) { if (error) { console.log(error); }});

      if (!Comments.findOne({ permlink: params.permlink }))
        Comments.loadComments(params.user, params.permlink, function (error) { if (error) { console.log(error); } });

      // User to process
      User.add(params.user, (error) => { if (error) { console.log('ERROR in adding a user to the DB:', error); } });

      // Get the user account history
      if(!PersonalHistory.findOne({author:params.user})) PersonalHistory.getPersonalHistory(params.user,500);

      // Blog posts
      Session.set('visiblecontent', 5);
      Session.set('blog_loaded',    false);
      Session.set('current-page',   1);
      Blog.getContentByBlog(params.user, 10, 'blog');
    }
});


// Direct access to an article
FlowRouter.route('/:tag/@:user/:permlink', {
    name: 'project',
    action: function (params, queryParams) {
        BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "article", topmenu: "topmenu" });
        FlowRouter.setQueryParams({ params: null, queryParams: null });
        FlowRouter.go('/')
        FlowRouter.go('/@' + params.user + '/' + params.permlink)
        Session.set('user', params.user)
        Session.set('article', params.permlink)
    }
});


// Error 404
FlowRouter.notFound = {
    action: function() {
       console.log('MUF', this)
    }
};
