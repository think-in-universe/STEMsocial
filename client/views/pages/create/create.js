// Rendering of the page
Template.create.rendered = function () {
  delete Session.keys['preview-beneficiaries'];
  if(Session.get('edit-post'))
  {
    Session.set('preview-title',Session.get('edit-post').title);
    Session.set('preview-body',  Blaze._globalHelpers['ToHTML'](Session.get('edit-post').body));
    document.getElementById('newarticle').posttitle.value = Session.get('edit-post').title;
    document.getElementById('newarticle').postbody.value = Session.get('edit-post').body;
    let json = Session.get('edit-post').json_metadata;
    if(typeof json==='string' || json instanceof String) json = JSON.parse(json);
    document.getElementById('newarticle').posttags.value = json.tags;
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

  // For image upload
  $('#image-input').on('change',Template.create.HandleImageUpload);


};


// Editor toolbar: generic buttons
Template.create.EditorTool = function(html, markdown, type)
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let text  = body.value.substring(start,end);
  if(!text) text = type;
  let imkd  = markdown.length;
  let ihtml = html.length;
  let mkd_cls = markdown;
  if(markdown.startsWith('#') || ['> '].includes(markdown)) mkd_cls = '';

  // Checking whether the font is already modified - > we need to remove the modifier
  if(markdown!='' && body.value.substring(start-imkd,start)==markdown && (mkd_cls=='' || body.value.substring(end,end+imkd)==markdown) )
  {
    body.value = body.value.substring(0,start-imkd) + text + body.value.substring(end+mkd_cls.length,body.value.length);
    body.selectionStart=end-imkd; body.selectionEnd=end-imkd;
  }
  else if(body.value.substring(start-(ihtml+2),start)=='<'+html+'>' && body.value.substring(end,end+ihtml+3)=='</'+html+'>')
  {
    body.value = body.value.substring(0,start-(ihtml+2)) + text + body.value.substring(end+ihtml+3,body.value.length);
    body.selectionStart=end-(ihtml+2); body.selectionEnd=end-(ihtml+2);
  }

  // the text is normal -> we need to add the modifier
  else if(markdown!='')
  {
    body.value = body.value.substring(0,start) + markdown + text + mkd_cls + body.value.substring(end,body.value.length);
    if(start==end) {body.selectionStart=start+imkd; body.selectionEnd=start+imkd+text.length;}
    else           {body.selectionStart=start+imkd+2+text.length; body.selectionEnd=start+imkd+2+text.length; }
  }
  else
  {
    body.value = body.value.substring(0,start) + '<' + html + '>' + text + '</' + html + '>' + body.value.substring(end,body.value.length);
    if(start==end) {body.selectionStart=start+ihtml+2; body.selectionEnd=start+ihtml+2+text.length; }
    else           {body.selectionStart=start+ihtml+2+text.length; body.selectionEnd=start+ihtml+2+text.length; }
  }

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};


// Editor toolbar: the div align environment
Template.create.EditorToolDiv = function(html, type)
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let text  = body.value.substring(start,end);
  if(!text) text = type;
  let ihtml = html.length;

  // Checking whether the font is already modified - > we need to remove the modifier
  if(body.value.substring(start-(ihtml+14),start)=='<div class=\"'+html+'\">' && body.value.substring(end,end+6)=='</div>')
  {
    body.value = body.value.substring(0,start-(ihtml+14)) + text + body.value.substring(end+6,body.value.length);
    body.selectionStart=start-(ihtml+14); body.selectionEnd=start-(ihtml+14) + text.length;
  }

  // the text is normal -> we need to add the modifier
  else
  {
    body.value = body.value.substring(0,start) + '<div class=\"' + html + '\">' + text + '</div>' + body.value.substring(end,body.value.length);
    body.selectionStart=start+ihtml+14; body.selectionEnd=start+ihtml+14+text.length;
  }

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};


// Editor toolbar: lists
Template.create.EditorToolList = function(tag)
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let text  = body.value.substring(start,end);

  // No text is provided: template list
  if(!text)
  {
    if(tag=='u')
    {
      body.value = body.value.substring(0,start) + '- item 1\n- item 2\n- item 3\n' +
        body.value.substring(end,body.value.length);
      body.selectionStart=start; body.selectionEnd=start+26;
    }
    else if(tag=='o')
    {
      body.value = body.value.substring(0,start) + '1. item 1\n2. item 2\n3. item 3\n' +
        body.value.substring(end,body.value.length);
      body.selectionStart=start; body.selectionEnd=start+29;
    }
  }

  // Some text is provided: inside the list
  else
  {
    if(tag=='u')
    {
      text = '- ' + text.replace(/\n/gm,'\n- ');
      if(text.match(/-\s{1,}- /gm)) { text=text.replace(/\n-/gm,'\n'); text=text.substring(1,text.length);}
    }
    else if(tag=='o')
    {
      text = text.split('\n');
      for(let i=0; i<text.length;i++) text[i] = (i+1).toString() + '. ' + text[i];
      text = text.join('\n');
      if(text.match(/\d+\.\s{1,}\d+\. /gm)) { text=text.replace(/\n\d+\./gm,'\n'); text=text.substring(2,text.length);}
    }
    body.value = body.value.substring(0,start) + text + body.value.substring(end,body.value.length);
    body.selectionStart=start; body.selectionEnd=start+text.length;
  }

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};


// Editor toolbar: adding tables
Template.create.EditorToolTable = function()
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;

  // Nothing is provided: we create a template
  body.value = body.value.substring(0,start) + '| Title column1 | Title column2 | Title column3 |\n' +
    '|-|-|-|\n' + '| Content column1 | Content column2 | Content column3 |\n' +
    '| ... | ... | ... |\n' +
  body.value.substring(end,body.value.length);
  body.selectionStart=start; body.selectionEnd=start+133;

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};



// Editor toolbar: image through a link
Template.create.EditorToolLink= function()
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let text  = body.value.substring(start,end);

  // Nothing is provided: we create a template
  if(!text)
  {
    body.value = body.value.substring(0,start)+'[Link description](Link) '+ body.value.substring(end,body.value.length);
    body.selectionStart=start; body.selectionEnd=start+24;
  }

  // A link is provided (assume it is the link itself)
  else if (text.startsWith('http'))
  {
    body.value = body.value.substring(0,start) + '[Link description]('+text+') ' +
        body.value.substring(end,body.value.length);
    body.selectionStart=start+1; body.selectionEnd=start+17;
  }

  // Something else is provided (assumes it it the link description)
  else
  {
    body.value = body.value.substring(0,start) + '['+text+'](Link) ' +
        body.value.substring(end,body.value.length);
    body.selectionStart=start+3+text.length; body.selectionEnd=start+7+text.length;
  }

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};


// Editor toolbar: links
Template.create.EditorToolImageLink= function()
{
  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let text  = body.value.substring(start,end);

  // Nothing is provided: we create a template
  if(!text)
  {
    body.value = body.value.substring(0,start) + '![Image description](Image link) ' +
        body.value.substring(end,body.value.length);
    body.selectionStart=start; body.selectionEnd=start+32;
  }

  // A link is provided (included in the code)
  else if (text.startsWith('http'))
  {
    body.value = body.value.substring(0,start) + '![Image description]('+text+') ' +
        body.value.substring(end,body.value.length);
    body.selectionStart=start; body.selectionEnd=start+22+text.length;
  }

  // Something else is provided (included in the description)
  else
  {
    body.value = body.value.substring(0,start) + '!['+text+'](Image link) ' +
        body.value.substring(end,body.value.length);
    body.selectionStart=start; body.selectionEnd=start+15+text.length;
  }

  // Updating the content
  Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
  body.focus();
};



// Handling image upload
Template.create.HandleImageUpload = event =>
{
  // Security
  if(event.target.files.length<1) return;
  let file  = event.target.files[0];
  if(!file.type.startsWith('image')) { alert('Error : Incorrect file type'); return; }
  if(file.size > 2*1024*1024)        { alert('Error : Exceeded size [2MB]'); return; }

  // Useful variables
  let body  = document.getElementById('newarticle').postbody;
  let start = body.selectionStart;
  let end   = body.selectionEnd;
  let alt   = body.value.substring(start,end);

  // Processing the file
  let url   = `https://api.cloudinary.com/v1_1/drrz8xekm/upload`;
  let xhr   = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  // upload progress event
  xhr.upload.addEventListener("progress", function (e)
   { console.log('upload progress...', percent_complete = (e.loaded / e.total)*100, '%'); }
  );

  // On change
  xhr.onreadystatechange = function (e)
  {
    if (xhr.readyState == 4 && xhr.status == 200)
    {
      // Adding the image to the post source
      let response = JSON.parse(xhr.responseText);
      if(!alt) alt = response.public_id;
      body.value = body.value.substring(0,start) + '![' + alt + '](' + response.secure_url + ') ' +
        body.value.substring(end,body.value.length);
      body.selectionStart = start+2; body.selectionEnd=start+2+alt.length;

      // Updating the content
      Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body.value));
      body.focus();
    }
  };

  // Sending the form
  let dform = new FormData();
  dform.append('upload_preset', 'steemstem');
  dform.append('tags', 'browser_upload');
  dform.append('file', file);
  xhr.send(dform);
}


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

  // toolbar
  'click .ui.button.bold'         : function(event) { Template.create.EditorTool('b'  ,'**','bold'); },
  'click .ui.button.italic'       : function(event) { Template.create.EditorTool('i'  ,'*','italic'); },
  'click .ui.button.underline'    : function(event) { Template.create.EditorTool('u'  ,'','underlined'); },
  'click .ui.button.strikethrough': function(event) { Template.create.EditorTool('del','~~','strikedthrough'); },
  'click .ui.button.subscript'    : function(event) { Template.create.EditorTool('sub','','superscripted'); },
  'click .ui.button.superscript'  : function(event) { Template.create.EditorTool('sup','','subscripted'); },
  'click .ui.button.h1'           : function(event) { Template.create.EditorTool('h1','# ','Header 1'); },
  'click .ui.button.h2'           : function(event) { Template.create.EditorTool('h2','## ','Header 2'); },
  'click .ui.button.h3'           : function(event) { Template.create.EditorTool('h3','### ','Header 3'); },
  'click .ui.button.h4'           : function(event) { Template.create.EditorTool('h4','#### ','Header 4'); },
  'click .ui.button.h5'           : function(event) { Template.create.EditorTool('h5','##### ','Header 5'); },
  'click .ui.button.h6'           : function(event) { Template.create.EditorTool('h6','###### ','Header 6'); },
  'click .ui.button.lefty'        : function(event) { Template.create.EditorToolDiv('pull-left','left-aligned'); },
  'click .ui.button.righty'       : function(event) { Template.create.EditorToolDiv('pull-right','right-aligned'); },
  'click .ui.button.justifyy'     : function(event) { Template.create.EditorToolDiv('text-justify','justified'); },
  'click .ui.button.centery'      : function(event) { Template.create.EditorTool('center','','centered'); },
  'click .ui.button.quote'        : function(event) { Template.create.EditorTool('blockquote','> ','a quote'); },
  'click .ui.button.codify'       : function(event) { Template.create.EditorTool('pre','```\n','some code\n'); },
  'click .ui.button.listuly'      : function(event) { Template.create.EditorToolList('u'); },
  'click .ui.button.listoly'      : function(event) { Template.create.EditorToolList('o'); },
  'click .ui.button.imagelink'    : function(event) { Template.create.EditorToolImageLink(); },
  'click .ui.button.link'         : function(event) { Template.create.EditorToolLink(); },
  'click .ui.button.imageup'      : function(event) { $('#image-input').click(); },
  'click .ui.button.tablify'      : function(event) { Template.create.EditorToolTable(); },

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
      let old = Session.get('edit-post');
      if(typeof old.json_metadata === 'string' || old.json_metadata instanceof String) old.json_metadata = JSON.parse(old.json_metadata);
      old.json_metadata.tags=tags;

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
        $('#postprob').text(JSON.stringify(response.message));
        $('.ui.button.submit').removeClass('loading')
        return;
      }
      $('#postprob').addClass("hidden")
      // Updating the database
      Content.update({author: project[0][1].author, permlink: project[0][1].permlink},
        {$set: {body: project[0][1].body, title: project[0][1].title, json_metadata: JSON.parse(project[0][1].json_metadata)}});
      // Redirection
      FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink);
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
          {$set: {body: project[0][1].body, title: project[0][1].title, json_metadata: JSON.parse(project[0][1].json_metadata)}});
        // Redirection
        FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink);
      }
      $('.ui.button.submit').removeClass('loading')
      return true
    });
  }
}



