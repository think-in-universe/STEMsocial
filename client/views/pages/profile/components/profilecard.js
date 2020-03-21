Template.profilecard.rendered = function () { }

// Events
Template.profilecard.events(
{
  // Go to user page
  'click .header.name': function (event) { event.preventDefault(); FlowRouter.go('/@' + this.name);} ,

  // Follow a user
  'click .follow-action': function(event)
  {
    if (localStorage.kc)
    {
      let json = JSON.stringify(['follow', { follower: localStorage.username, following: this.name, what:["blog"]}]);
      window.hive_keychain.requestCustomJson(localStorage.username, "follow", "Posting", json, "follow", function(response)
      {
        $('.ui.button.follow').removeClass('loading');
        document.getElementsByClassName('follow-action')[0].style.display = "none";
        document.getElementsByClassName('unfollow-action')[0].style.display = "";
      });
    }
    else
    {
      $('.ui.button.follow').addClass('loading');
      steemconnect.follow(this.name, function (error)
      {
        // Error
        if (error) { console.log('Following with steemconnect', error); return; }
        // Everything is fine
        Followers.loadFollowers(name);
        $('.ui.button.follow').removeClass('loading');
        document.getElementsByClassName('follow-action')[0].style.display = "none";
        document.getElementsByClassName('unfollow-action')[0].style.display = "";
      });
    }
  },
  // Unfollow a user
  'click .unfollow-action': function(event)
  {
    if (localStorage.kc)
    {
      let json = JSON.stringify(['follow', { follower: localStorage.username, following: this.name, what:[]}]);
      window.hive_keychain.requestCustomJson(localStorage.username, "follow", "Posting", json, "follow", function(response)
      {
        $('.ui.button.follow').removeClass('loading');
        document.getElementsByClassName('unfollow-action')[0].style.display = "none";
        document.getElementsByClassName('follow-action')[0].style.display = "";
      });
    }
    else
    {
      $('.ui.button.unfollow').addClass('loading');
      steemconnect.unfollow(this.name, function (error)
      {
        // Error
        if (error) { console.log('Unfollowing with steemconnect', error); return; }
        // Everything is fine
        Followers.loadFollowers(name);
        $('.ui.button.unfollow').removeClass('loading');
        document.getElementsByClassName('unfollow-action')[0].style.display = "none";
        document.getElementsByClassName('follow-action')[0].style.display = "";
      });
    }
  }
});

