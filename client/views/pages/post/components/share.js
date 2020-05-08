// Actions to share the post
Template.share.events(
{
  // // Facebook
  // 'click .facebook.button': function (event) { event.stopPropagation(); },
  // // Twitter
  // 'click .twitter.button':  function (event) { event.stopPropagation(); },
  // // Linkedin
  // 'click .linkedin.button': function (event) { event.stopPropagation(); },
  // // Google
  // 'click .google.button':   function (event) { event.stopPropagation(); },
  //Hive
  'click .hive.button': function (event)
  {
    event.stopPropagation();
    event.preventDefault()
    $('.ui.share.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.sharemodal, { project: this }));
    $('.ui.share.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.sharemodal.init(this.author,this.permlink)
  }
})
