// Rendering of the page
Template.create.rendered = function () {
  delete Session.keys['preview-beneficiaries'];
  if(Session.get('edit-post'))
  {
    Session.set('preview-title',Session.get('edit-post').title);
    Session.set('preview-body', Session.get('edit-post').body);
    document.getElementById('newarticle').posttitle.value = Session.get('edit-post').title;
    document.getElementById('newarticle').postbody.value = Session.get('edit-post').body;
    document.getElementById('newarticle').posttags.value = Session.get('edit-post').json_metadata.tags;
  }

  // Saving the post title for the post preview method
  $('#posttitle').on('input',function()
    { Session.set('preview-title',document.getElementById('newarticle').posttitle.value) }
  );

  // Saving the post body for the preview part
  $('#postbody').on('input', function()
    { Session.set('preview-body', Blaze._globalHelpers['ToHTML'](document.getElementById('newarticle').postbody.value)); }
  );

  // tags
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
Template.create.events({
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
    let body     = document.getElementById('newarticle').postbody.value;
    let tags     = document.getElementById('newarticle').posttags.value;
    let permlink = title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g, '-').toLowerCase().slice(0,50) + '-' +
      (Math.round((new Date()).getTime() / 1000)).toString();

    // payout configurations
    let payout     = '0';
    if(!Session.get('edit-post')) payout = document.getElementById('newarticle').payoutdistr.value;
    let max_payout = '1000000.000 HBD';
    let perc_HBD   = 10000;
    if      (payout=='0')   max_payout = '0.000 HBD';
    else if (payout=='100') perc_HBD   = 0;

    // Getting the tags
    if(tags=="") tags=['hive-196387'];
    else         tags = tags.split(',');
    tags = tags.filter(obj => { return obj!='hive-196387';});
    tags.unshift('hive-196387');

    // JSON metadata
    let images = [];
    let __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
    if (__imgRegex.test(body)) images=body.match(__imgRegex);
    let json_metadata = { tags:tags, app: 'stemsocial'};

    // Beneficiaries
    let beneficiaries = {};
    if(Session.get('preview-beneficiaries')) beneficiaries = JSON.parse(Session.get('preview-beneficiaries'));
    if(!Session.get('edit-post') && document.getElementById('newarticle').stmscl_bx.checked)
    {
      let stemsocial_val = parseFloat(document.getElementById('newarticle').stmscl_bnf.value);
      if(Object.keys(beneficiaries).length>0 && Object.keys(beneficiaries).includes('stemsocial'))
        beneficiaries['stemsocial'] = Math.max(beneficiaries['stemsocial'],stemsocial_val);
      else beneficiaries['stemsocial'] = stemsocial_val;
    }
    let bnf_object = [];
    Object.keys(beneficiaries).forEach((key,idx)=>{ bnf_object.push({ account:key, weight:beneficiaries[key]*100})});

    // Putting everything together
    let post_object = [
      ['comment', { parent_author: '', parent_permlink: tags[0], author:localStorage.username, permlink:permlink,
                   title:title, body:body, json_metadata: JSON.stringify(json_metadata) }],
        ['comment_options', { author:localStorage.username, permlink:permlink, max_accepted_payout:max_payout,
                    percent_steem_dollars:perc_HBD, allow_votes:true, allow_curation_rewards:true,
                   extensions: [] } ]
    ];
    if(bnf_object.length>0) post_object[1][1].extensions =  [  [0, { beneficiaries: bnf_object} ] ];

    // Post edition
    if(Session.get('edit-post'))
    {
      let old = Session.get('edit-post'); old.json_metadata.tags=tags;
      post_object = [
        ['comment', { parent_author: old.parent_author, parent_permlink :old.parent_permlink, author: old.author,
                      permlink:old.permlink, title:title, body:body, json_metadata: JSON.stringify(old.json_metadata)}]
      ];
      delete Session.keys['edit-post'];
    }

    // submission
    Template.create.submit(post_object);
  }
});

// Helpers
Template.create.helpers({
  // Post edition
  NotPostEdition: function()
  {
    if(Session.get('edit-post')) return false;
    else return true;
  },
  PostEdition: function()
  {
    if(Session.get('edit-post')) return true;
    else return false;
  },

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


// Submit the post
Template.create.submit= function(project)
{
  if (localStorage.kc)
  {
    let comment =project[0][1];
    let options = '';
    if(project.length>1)
    {
      options = project[1][1];
      if(options.extensions.length==0) { options=''; }
    }
    if (options!='') { options = JSON.stringify(options); }
    window.hive_keychain.requestPost(comment.author, comment.title , comment.body, comment.parent_permlink,
      comment.parent_author, comment.json_metadata, comment.permlink, options, function(response)
    {
      if(!response.success)
      {
        console.log("Error with keychain (cannot post):", response);
        $('#postprob').removeClass("hidden")
        $('#postprob').text(JSON.stringify(response.error));
        $('.ui.button.submit').removeClass('loading')
        return;
      }
      $('#postprob').addClass("hidden")
      // Updating the database
      Content.update({author: project[0][1].author, permlink: project[0][1].permlink},
        {$set: {body: project[0][1].body, title: project[0][1].title, json_metadata: project[0][1].json_metadata}});
      // Redirection
      FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink);      var start = new Date().getTime();
    });
  }
  else
  {
    hivesigner.send(project, function (error, result)
    {
      if (error)
      {
        $('#postprob').removeClass("hidden")
        $('#postprob').text(error)
        console.log("Error with hivesigner:", error.error_description)
        console.log("status of the submission stuff:", project)
        if(error.error_description)
          $('#postprob').text(error.error_description)
      }
      else
      {
        $('#postprob').addClass("hidden")
        // Updating the database
        Content.update({author: project[0][1].author, permlink: project[0][1].permlink},
          {$set: {body: project[0][1].body, title: project[0][1].title, json_metadata: project[0][1].json_metadata}});
        // Redirection
        FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink);
      }
      $('.ui.button.submit').removeClass('loading')
      return true
    });
  }
}



