// Rendering
Template.maincards.rendered = function () {
}


// Events
Template.maincards.events({
  // Navigation between the weeks
  'click .go-to-wk': function(event) {
    Session.set('visiblecontent',Session.get('visiblecontentlimit'));
    Session.set('current_week', parseInt(this))
    AccountHistory.GetContent(5);
    $('html,body').scrollTop(0);
  },
  'click .load-more-weeks': function(event)
    { Session.set('loaded_week', Session.get('loaded_week')-1); AccountHistory.getVotes(); }
})


// Helpers
Template.maincards.helpers({
  // Get the number of pages for the post to display
  GetToLoad: function()
  {
    let wk_array = Array.from({length:(Session.get('this_week')-Session.get('loaded_week'))},
      (v,k)=>k+Session.get('loaded_week')+1);
    return wk_array.reverse().map(function(e) { return e.toString();});
  },

  // Get the week number
  Crop: function(longweek) { return longweek.slice(2); },

  // Is it the currently shown week?
  MyWeek: function() { return (Session.get('current_week').toString()==this) },

  // Has the content been loaded?
  IsNotLoaded: function() { return (Content.find().fetch().length<=50) }


});
