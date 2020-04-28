// Rendering of the page
Template.newcreate.rendered = function () {
  delete Session.keys['preview-beneficiaries'];

  // Saving the post title for the post preview method
  $('#posttitle').on('input',function()
    { Session.set('preview-title',document.getElementById('newarticle').posttitle.value) }
  );

  // Saving the post body for the preview part
  $('#postbody').on('input', function()
    { Session.set('preview-body', Blaze._globalHelpers['ToHTML'](document.getElementById('newarticle').postbody.value)); }
  );

  // tags
  $('#posttags').on('change',function()
    { console.log('bla'); Session.set('preview-tags',document.getElementById('newarticle').posttags.value) }
  );
  $('.ui.multiple.dropdown').dropdown(
  {
    allowAdditions: true,
    keys: { delimiter: 32 },
    onNoResults: function (search) { },
    onChange: function () {
      var ntags = $('#posttags').attr('value').split(",").length;
      if($('#posttags').attr('value').split(',').includes('hive-196387')) ntags--
      if (ntags>8)
      {
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
        $('.to.message.yellow').removeClass('hidden');
        $('.to.message.yellow').addClass('visible');
      }
      else
      {
        $('.to.message.yellow').removeClass('visible');
        $('.to.message.yellow').addClass('hidden');
      }
    }
  });

  // Checks of the post
  $('#newarticle').form(
  {
    fields:
    {
      title:
      {
        identifier: 'posttitle',
        rules: [ { type: 'minLength[5]', prompt: translate('COMMON_POST_TITLE') } ]
      },
      body:
      {
        identifier: 'postbody',
        rules: [ { type: 'empty', prompt: translate('COMMON_POST_BODY') } ]
      }
    }
  });

};


// Control of the different buttons
Template.newcreate.events({
  // Add beneficiary
  'click .ui.button.add-beneficiary': function (event)
  {
     Session.set('beneficiary-edit',false);
     $('.ui.beneficiary.modal').remove();
     $('article').append(Blaze.toHTMLWithData(Template.beneficiarymodal, {data:this}));
     $('.ui.beneficiary.modal').modal('setting', 'transition', 'scale').modal('show');
     Template.beneficiarymodal.init('','')
  },

  // Edit an existing beneficiary
  'click #edit-beneficiary': function(event)
  {
    Session.set('beneficiary-edit',true);
    $('.ui.beneficiary.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.beneficiarymodal, {data:this}));
    $('.ui.beneficiary.modal').modal('setting', 'transition', 'scale').modal('show')
    let bnf = event.target.getAttribute('name').split('-')[0];
    let shr = event.target.getAttribute('name').split('-')[1];
    Template.beneficiarymodal.init(bnf, shr);
  },

  // Removing an existing beneficiary
  'click #remove-beneficiary': function(event)
  {
    let json = JSON.parse(Session.get('preview-beneficiaries'));
    delete json[event.target.getAttribute('name')];
    Session.set('preview-beneficiaries', JSON.stringify(json));
  },

  // Submission of the post
  'click .ui.button.submit': function (event)
  {
    // Post invalid (title or vody)
    if(!$('#newarticle').form('is valid')) return $('#newarticle').form('validate form');

    // Everything is fine -> submission
    $('#newarticle').form('validate form');
    $('.ui.button.submit').addClass('loading');

    // post information
    let title    = document.getElementById('newarticle').posttitle.value;
    let permlink = title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g, '-').toLowerCase().slice(0,50) + '-' +
      (Math.round((new Date()).getTime() / 1000)).toString();

    let post_object = [
      ['comment', { parent_author: '', parent_permlink: tags[0], author:author, permlink:permlink, title:title,
                    body: body, json_metadata: JSON.stringify(json_metadata) }],
        ['comment_options', { author: author, permlink: permlink, max_accepted_payout: '1000000.000 SBD',
                    percent_steem_dollars: percent_steem_dollars, allow_votes: true, allow_curation_rewards: true,
                   extensions: [] } ]
    ];

    console.log('title    = ', title);
    console.log('permlink = ', permlink);
//      var project = Template.create.createProject(document.getElementById('newarticle'))
//      Template.create.submitproject(project)
  }
});

// Helpers 
Template.newcreate.helpers({
  // Function allowing to display the post title for the preview part
  DisplayPostTitle: function() { return Session.get('preview-title') },

  // Function to display the post body for the preview part
  DisplayPostBody: function()  { return Session.get('preview-body'); },

  // Loading the list with all beneficiaries attached to a post 
  Beneficiaries: function()
  {
    if(Session.get('preview-beneficiaries')) return true;
    else return false;
  },
  DisplayBeneficiaries: function()
  {
    let bnf_list = JSON.parse(Session.get('preview-beneficiaries'));
    if(bnf_list) return Object.keys(bnf_list).map(function(k) { return [k, bnf_list[k]]; });
    else return [];
  },
  // Function allowing to display a single beneficiary
  DisplayBeneficiary: function(beneficiary) { return beneficiary[0] },
  DisplayShare: function(beneficiary) { return beneficiary[1] },


});

