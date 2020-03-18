// Rendering
Template.mainlist.rendered = function () {
}

// Events
Template.mainlist.events({
  // Navigation between the weeks
  'click .go-to-wk': function(event) {
    Session.set('visiblecontent',20)
    Session.set('current_week', parseInt(this))
    if((parseInt(this)-3)<Session.get('loaded_week'))
      { Session.set('loaded_week', (parseInt(this)-3)); AccountHistory.getVotes(); }
    $('html,body').scrollTop(0);
  },
  'click .load-more-weeks': function(event)
    { Session.set('loaded_week', Session.get('loaded_week')-2); AccountHistory.getVotes(); }
})

// Helpers
Template.mainlist.helpers({
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
