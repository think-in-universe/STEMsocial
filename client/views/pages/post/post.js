// Rendering of the posts
Template.post.rendered = function ()
{
  $('.image.post')
    .visibility({ type: 'image', transition: 'fade in', duration: 1000 })

  $('.actipop')
    .popup();
}

// Helpers
Template.post.helpers({});

// Events
Template.post.events(
{
  // Click on the post thumbnail
  'click .image': function (event)
  {
    event.preventDefault()
    FlowRouter.go('/@' + this.author + '/' + this.permlink)
  },

  // Click on the post description
  'click .meta': function (event)
  {
    event.preventDefault()
    FlowRouter.go('/@' + this.author + '/' + this.permlink)
  },

  // Click on thje post title
  'click .header': function (event)
  {
    event.preventDefault()
    FlowRouter.go('/@' + this.author + '/' + this.permlink)
  },

  // Popup
  'click .button.actipop': function (event)
  {
    event.stopPropagation();
    event.preventDefault()
  },

  // Get onto the user profile
  'click #user': function (event)
  {
    event.stopPropagation();
    event.preventDefault()
    FlowRouter.go('/@' + this.author)
  },

  // Vote action
  'click  #vote': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    $('.ui.vote.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.votemodal, { project: this }));
    $('.ui.vote.modal.' + this.permlink).modal('setting', 'transition', 'scale').modal('show')
    Template.votemodal.init()
  }
})

