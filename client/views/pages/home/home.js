import moment from 'moment'
import { get, set } from 'idb-keyval'

// Helpers
Template.home.helpers({
  // Are we in grid view mode?
  isGridView: function () { return Session.get('gridview') },

  GetPromoted: function ()
  {
    // Safety
    if(!Session.get('Promoted')) return;

    // Get the list of posts that can be promoted
    let query = { parent_author: '', permlink: {$in: Session.get('Promoted')} };
    let promo_content = Content.find(query).fetch();
    if(promo_content.length > Session.get('N_promolist') || promo_content.length==0)
      { Session.set('N_promolist', promo_content.length) }
    else if(promo_content.length==3)
      { return Session.get('promolisted'); }

    // The promolist needs to be re-evaluated
    let content = []; let titles = [];
    for (let i=0; i<promo_content.length; i++)
    {
      if( (promo_content[i].type=='steemstem') || (Session.get('settings').whitelist.includes(promo_content[i].author)) )
         { content.push(promo_content[i]); titles.push(promo_content[i].permlink); continue; }
    }

    // Add the last steemstem and lemouth-dev posts
    let last_stem = Content.find({ parent_author:'', author:'steemstem' }, { sort: {created:-1} }).fetch();
    let last_dev = Content.find({ parent_author:'', author:'lemouth-dev' }, { sort: {created:-1} }).fetch();
    while(content.length<3)
    {
      if(last_stem.length>0 && !titles.includes(last_stem[0].permlink))
        { content.push(last_stem[0]); titles.push(last_stem[0].permlink); continue;}
      if(last_dev.length>0  && !titles.includes(last_dev[0].permlink))
        { content.push(last_dev[0]); titles.push(last_dev[0].permlink);  continue; }
      if(last_stem.length>1 && !titles.includes(last_stem[1].permlink))
        { content.push(last_stem[1]); titles.push(last_stem[1].permlink); continue;}
      break;
    }

    // Randomly select three posts
    let selected = [];
    while(selected.length<Math.min(3,content.length))
    {
      let item = content[Math.floor(Math.random()*content.length)];
      if(!selected.includes(item)) selected.push(item);
    }
    Session.set('promolisted', selected);
    return selected;
  }
});


// Rendering
Template.home.rendered = function () {
  // TOS
  get('steemstem_storage').then((k) => {
    let are_tos_read = k;
    if(!are_tos_read)
    {
      $('.ui.tos.modal').remove();
      $('article').append(Blaze.toHTMLWithData(Template.tosmodal, { data:this}));
      $('.ui.tos.modal').modal('setting', 'transition', 'scale').modal('show');
      Template.tosmodal.init();
    }
  });

  // The filtering checkbox
  $('.menu .item').tab()
  $('.topposts.checkbox')
  .checkbox(
  {
    onChecked:   function()
    {
      document.getElementById("medposts").checked = false;
      document.getElementById("filter").checked = false;
      Session.set('superfilter','top');
      Session.set('unfiltered',false);
      Session.set('visiblecontent',12);
    },
    onUnchecked: function() { Session.set('superfilter',''); Session.set('visiblecontent',12); }
  });
  $('.menu .item').tab()
  $('.medposts.checkbox')
  .checkbox(
  {
    onChecked: function()
    {
      document.getElementById("filter").checked = false;
      document.getElementById("topposts").checked = false;
      Session.set('superfilter','medium');
      Session.set('unfiltered',false);
      Session.set('visiblecontent',12);
    },
    onUnchecked: function() { Session.set('superfilter',''); Session.set('visiblecontent',12); }
  });
  $('.menu .item').tab()
  $('.filter.checkbox')
  .checkbox(
  {
    onChecked: function()
    {
      document.getElementById("medposts").checked = false;
      document.getElementById("topposts").checked = false;
      Session.set('superfilter','');
      Session.set('unfiltered',true);
      Session.set('visiblecontent',12);
    },
    onUnchecked: function() { Session.set('unfiltered',false);  Session.set('visiblecontent',12); }
  });


  // Other options
  Session.set('gridview',false)
  Session.set('visiblecontent',12)
  $('.ui.bottom.cnt')
  .visibility({
      once: false,
      observeChanges: true,
      onBottomVisible: function () {
              Session.set('visiblecontent', Session.get('visiblecontent') + 8)
      }
  })
}

// Events
Template.home.events({
  'click .menu .item': function (event) { event.preventDefault() },

  // Switch to grid view
  'click .switch': function (event) {
    event.preventDefault();
    Session.set('gridview',!Session.get('gridview'));
  },
});
