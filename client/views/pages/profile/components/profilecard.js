// Events
Template.profilecard.events(
{
  // Go to user page
  'click .header.name': function (event) { event.preventDefault(); FlowRouter.go('/@' + this.name);} ,

  // Follow a user
  'click .follow-action': function(event)
  {
    // Updating the button
    $('.ui.button.follow').addClass('loading');
    // Call to Hive
    let js_res = { follower: localStorage.username, following: this.name, what:["blog"]};
    let json = JSON.stringify(['follow', js_res]);
    HiveConnect(['follow', localStorage.username, "follow", "Posting", json, "follow"], function(response)
    {
      // Updating the buttons
      $('.ui.button.follow').removeClass('loading');
      // Updating the DB
      Followers.upsert(js_res, js_res);
    });
  },

  // Unfollow a user
  'click .unfollow-action': function(event)
  {
    // Updating the button
    $('.ui.button.follow').addClass('loading');
    // Call to Hive
    let js_res = { follower: localStorage.username, following: this.name, what:[]};
    let json = JSON.stringify(['follow', js_res]);
    HiveConnect(['unfollow', localStorage.username, "follow", "Posting", json, "follow"], function(response)
    {
      // Updating the buttons
      $('.ui.button.follow').removeClass('loading');
      // Updating the DB
      Followers.remove({follower:js_res['follower'], following:js_res['following']});
    });
  }
});

