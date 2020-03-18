// Rendering of the posts
Template.card.rendered = function ()
{
  $('.image.card')
    .visibility({type: 'image', transition: 'fade in', duration: 1000 })

    $('.actipop')
    .popup();
}

// Helpers
Template.card.helpers({
  // Check whether the post has been posted with steemstem.io
  UsingSSio: function() { return (this.json_metadata && this.json_metadata.app=='steemstem') },

  // Check whether the author has set SteemSTEM as a beneficiary
  SetBeneficiary: function()
  {
    bnf_list = []
    for(i=0; i<this.beneficiaries.length;i++)
      bnf_list.push(this.beneficiaries[i].account)
    return bnf_list.includes('steemstem')
  }
})

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

