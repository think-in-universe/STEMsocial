import { Template } from "meteor/templating";
import { Session } from "meteor/session";

// Main route
FlowRouter.route('/', {
  name: 'home',
  action: function (params, queryParams) {
      DocHead.removeDocHeadAddedTags();
      BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "home", topmenu: "topmenu" });
      $('.actived').removeClass('actived');
      $('.steemstem.home').addClass('actived');
      Session.set('currentFilter', false);
      Session.set('currentSearch', false);
      Session.set('currentTag', false);
      Session.set('isonedit', false);
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
    Session.set('preview-tags','')
    BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "create", topmenu: "topmenu" });
  }
});


// Login to the app + implementation of the redirection to the previous page
// (if the connection happens after trying to do something with an expired or non-existing token)
FlowRouter.route('/login', {
    name: 'login',
    action: function (params, queryParams) {
        DocHead.removeDocHeadAddedTags()
        localStorage.clear();
        localStorage.setItem('accesstoken', queryParams.access_token)
        localStorage.setItem('expires_in', queryParams.expires_in)
        localStorage.setItem('username', queryParams.username)
        var state=''
        var command =''
        if(queryParams.state)
        {
          state = queryParams.state
          command = state.substring(state.indexOf('----ssio----')+12).split('_')
          state = state.substring(0,state.indexOf('----ssio----'))
        }
        var time = new Date();
        FlowRouter.setQueryParams({ params: null, queryParams: null });
        time = new Date(time.getTime() + 1000 * (parseInt(localStorage.expires_in) - 10000));
        localStorage.setItem('expires_at', time)
        if(command!='')
        {
          sc2.setAccessToken(localStorage.accesstoken);
          switch(command[0])
          {
            case 'vote':
              sc2.vote(localStorage.username, command[1], command[2], parseInt(command[3]),
                function (err, result) { if(err) { console.log(err)} })
              break;
            case 'claim':
              sc2.claimRewardBalance(localStorage.username, command[1], command[2], command[3],
                function (err, result) { if(err) { console.log(err)} })
              break;
            case 'comment':
              var permlink = Math.random(localStorage.username + command[2]).toString(36).substr(2, 9)
              sc2.comment(command[1], command[2] ,localStorage.username, permlink, permlink, command[3], JSON.parse(command[4]),
                function (err, result) { if(err) { console.log(err)} })
              break;
            case 'commentupdate':
              sc2.comment(command[1], command[2] ,localStorage.username, command[3], commandp[4], command[5], JSON.parse(command[6]),
                function (err, result) { if(err) { console.log(err)} })
              break;
            case 'broadcast':
              var ops='';
              if(command[1]=='1')
                { ops = [ ['comment', JSON.parse(command[2].split('UNDERSKORE').join('_')) ] ]; }
              else if(command[1]=='2')
              {
                 ops = [
                   ['comment', JSON.parse(command[2].split('UNDERSKORE').join('_')) ],
                   ['comment_options', JSON.parse(command[3].split('UNDERSKORE').join('_')) ] ];
                 ops[1][1].author=localStorage.username
              }
              ops[0][1].author=localStorage.username
              sc2.broadcast(ops, function (err, result) { if(err) { console.log(err)} });
              state = state.replace('undefined',localStorage.username)
              break;
            case 'follow':
              sc2.follow(localStorage.username, command[1],  function (err, result) { if(err) { console.log(err)} });
              if (state=='undefined') { state='' }
              break;
            case 'unfollow':
              sc2.unfollow(localStorage.username, command[1],  function (err, result) { if(err) { console.log(err)} });
              if (state=='undefined') { state='' }
              break;
            case 'reblog':
              sc2.reblog(localStorage.username, command[1], command[2],
                function (err, result) { if(err) { console.log(err)} })
              break;
            case 'metadata':
              sc2.updateUserMetadata(JSON.parse(command[2].split('UNDERSKORE').join('_')), function (err, result) {
                if(result) { steemconnect.me(); cb(null) }
                else       { console.log(err) }
              });
              break;
          }
        }
        FlowRouter.go('/'+state)
    }
});


// Getting all blog posts written by a user
FlowRouter.route('/@:user',
{
  name: 'profile',
  action: function (params, queryParams) {
    DocHead.removeDocHeadAddedTags()
    BlazeLayout.render('mainlayout', { sidebar: "sidebar", main: "profile", topmenu: "topmenu" });
    Session.set('user', params.user)
    Session.set('currentprofiletab','blog')
    Session.set('ToPass',0)
    Session.set('MaxToPass',0)
    Session.set('Queried','')
    Session.set('Query-done',false)
    Session.set('more-blogs',true)
    User.add(params.user, function (error) { if (error) { console.log(error) } })
    if(!PersonalHistory.findOne({author:params.user}))
      PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) { console.log(error) }
      })
    Followers.loadFollowers(params.user, function (error) { if (error) { console.log(error) } })
    Blog.getContentByBlog(params.user, 51, 'blog', function (error) { if (error) { console.log(error) } })
    $('.menu.profile .item').tab('change tab', 'first')
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
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        if(!PersonalHistory.findOne({author:params.user}))
        PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Followers.loadFollowers(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        $('.menu.profile .item').tab('change tab', 'second')
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
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        if(!PersonalHistory.findOne({author:params.user}))
        PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Followers.loadFollowers(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        $('.menu.profile .item').tab('change tab', 'third')
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
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        if(!PersonalHistory.findOne({author:params.user}))
        PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Followers.loadFollowers(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
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
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        if(!PersonalHistory.findOne({author:params.user}))
        PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Followers.loadFollowers(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
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
        steem.api.getContent(params.user, params.permlink, function (error, result)
        {
          if(error) {console.log('error = ', error); }
          else
          {
             var __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
             if(result.body.match(__imgRegex))
             {
               var img = 'https://steemitimages.com/0x0/' + result.body.match(__imgRegex)[0];
               DocHead.addMeta({property: 'og:image', content: img})
             }
             DocHead.addMeta({property: 'title', content: result.title})
             DocHead.addMeta({property: 'og:title', content: result.title})
             DocHead.addMeta({property: 'og:url', content: 'https://www.steemstem.io/#!'+result.url})
             desc = Blaze._globalHelpers['remarkableFormatter'](result.body)
             desc = Blaze._globalHelpers['xssShortFormatter'](desc)
             desc = Blaze._globalHelpers['shortDescription'](desc)
             desc = desc.split('\n').join(' ')
             DocHead.addMeta({property: 'og:description', content: desc})
             DocHead.addMeta({property: 'description', content: desc})
          }
        })
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Blog.getContentByBlog(params.user, 20, 'blog', function (error) {
            if (error) {
                console.log(error)
            }
        })
        window.scrollTo(0,0)
        Followers.loadFollowers(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
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
        if (!Content.findOne({ permlink: params.permlink })) {
            Content.getContent(params.user, params.permlink,"article", function (error) {
                if (error) {
                    console.log(error)
                }
            })
        }
        if (!Comments.findOne({ permlink: params.permlink })) {
            Comments.loadComments(params.user, params.permlink, function (error) {
                if (error) {
                    console.log(error)
                }
            })
        }
        User.add(params.user, function (error) {
            if (error) {
                console.log(error)
            }
        })
        PersonalHistory.getPersonalHistory(params.user,100, function (error) {
            if (error) {
                console.log(error)
            }
        })
        Blog.getContentByBlog(params.user, 20, 'blog', function (error) {
            if (error) {
                console.log(error)
            }
        })

        // Content.getContentByAuthor(params.user, "", function (error) {
        //     if (error) {
        //         console.log(error)
        //     }
        // })
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
