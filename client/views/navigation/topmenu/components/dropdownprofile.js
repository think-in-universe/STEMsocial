Template.dropdownprofile.rendered = function () {
    $('.ui.dropdown.profile').dropdown()
  }

  Template.dropdownprofile.events({
    'click #logout': function (event) {
      event.preventDefault()
      MainUser.remove({})
      localStorage.removeItem('username')
      localStorage.removeItem('accesstoken')
      localStorage.removeItem('expireat')
      localStorage.removeItem('kc')
    },
    'click #blog': function (event) {
      event.stopPropagation();
      event.preventDefault()
      FlowRouter.go('#!/@' + this.name)
  },
  'click #create': function (event) {
    event.stopPropagation();
    event.preventDefault()
    FlowRouter.go('#!/create')
}
  })
  
