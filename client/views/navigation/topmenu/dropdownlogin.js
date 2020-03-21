//Rendering
Template.dropdownlogin.rendered = function () {
  $('.ui.dropdown.login').dropdown()
}

// Events
Template.dropdownlogin.events({
  // login with SteemConnect
  'click #steemconnect': function (event) {
    event.preventDefault()
    sessionStorage.setItem('currentroute', FlowRouter.current().path)
    window.location.href = sc2.getLoginURL()
  },
  // login with SteemKeychain
  'click #hivekeychain': function (event)
  {
    event.preventDefault();
    event.stopPropagation();
    $('.ui.hivekeychain.modal').remove();
    $('article').append(Blaze.toHTMLWithData(Template.hivekeychainmodal, { data: this }));
    $('.ui.hivekeychain.modal').modal('setting', 'transition', 'scale').modal('show');
    Template.hivekeychainmodal.init();
  }
});
