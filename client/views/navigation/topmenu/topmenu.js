Template.topmenu.rendered = function ()
{
  $('.ui.dropdown.language').dropdown({
    useLabels: false,
    onChange: function (value, text, $selectedItem) {
      sessionStorage.setItem('lang',value)
      Session.set('lang',value)
      loadtranslations(value, function (error) { if (error) console.log(error); });
    }
  });

  // fix main menu to page on passing
  $('.main.menu').visibility({ type: 'fixed' });
  $('.overlay').visibility({ type: 'fixed', offset: 200 });

  $('.menu .item').tab()

  if(sessionStorage.getItem('lang'))
  {
    Session.set('lang',sessionStorage.getItem('lang'))
    $(".ui.dropdown.language").dropdown("set selected",Session.get('lang'))
  }
  else{
    var userLang = navigator.language || navigator.userLanguage;
    sessionStorage.setItem('lang',userLang.substring(0, 2))
    Session.set('lang',userLang.substring(0, 2))
    $(".ui.dropdown.language").dropdown("set selected", userLang.substring(0, 2))
  }

  // show dropdown on hover
  $('.ui.dropdown.stemsocial').dropdown({});
  $('.ui.sidebar').sidebar('setting', 'transition', 'overlay')

}

// Events
Template.topmenu.events({
  'click #tag': function (event) {
    event.preventDefault()
    $('.actived').removeClass('actived')
    $('.stemsocial.' + this.category).addClass('actived')
    if (!this.category) {
      $('.stemsocial.home').addClass('actived')
      FlowRouter.go('/')
      Session.set('currentSearch', false)
    }
    else {
      FlowRouter.go('/' + this.category)
      Session.set('currentSearch', this.category)
    }
  },
  'click .item.submenu': function (event) {
    $('.actived').removeClass('actived')
    $('.stemsocial.' + this.category).addClass('actived')
    if (!this.category) {
      $('.stemsocial.home').addClass('actived')
      FlowRouter.go('/')
      Session.set('currentSearch', false)
    }
    else {
      FlowRouter.go('/' + event.target.textContent)
      Session.set('currentSearch', event.target.textContent)
    }
  },
  'click #display-menu': function (event) {
    $('.ui.sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle')

  },
  'click #login': function (event) {
    event.preventDefault()
    sessionStorage.setItem('currentroute', FlowRouter.current().path)
    window.location.href = sc2.getLoginURL()
  },
  'click #logout': function (event) {
    event.preventDefault()
    MainUser.remove({})
    localStorage.removeItem('username')
    localStorage.removeItem('accesstoken')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('expires_in')
  },
});
