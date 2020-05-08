// Rendering of the posts
Template.card.rendered = function ()
{
  $('.image.card')
    .visibility({type: 'image', transition: 'fade in', duration: 1000 })

    $('.actipop')
    .popup();
}

// Helpers
Template.card.helpers({ });

// Events
Template.card.events(
{
  // Click on the post thumbnail
  'click .image': function (event)
  {
    event.preventDefault()
    FlowRouter.go('/@' + this.author + '/' + this.permlink)
  },

  // Click on the post description
  'click .description': function (event)
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
  'click .author_name': function (event)
  {
    event.stopPropagation();
    event.preventDefault()
    FlowRouter.go('/@' + this.author)
  },

  // Vote actin
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

