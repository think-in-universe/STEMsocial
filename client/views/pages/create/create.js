// Rendering of the page
Template.create.rendered = function () {
    // Configuration of the dropdown menu where tags can be entered
    // We limit in particular the number of tag to four + #steemstem
    $('.ui.multiple.dropdown').dropdown({
        allowAdditions: true,
        keys: {
         delimiter: 32,
        },
        onNoResults: function (search) { }, 
        onChange: function () {
          var tags = $('#tags').attr('value').split(",").length;
          if($('#tags').attr('value').split(',').includes('steemstem'))
            tags--
          if (tags <= 10) {
            $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
          }
          else if (tags>10) {
            $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
            $('.to.message.yellow').removeClass('hidden');
            $('.to.message.yellow').addClass('visible');
          }
        }
    });

    // Saving the post title for the post preview method
    $('#title').on('input',function()
    {
      Session.set('preview-title',document.getElementById('newarticle').title.value)
    });

    // Configuration of the WYSIWYG text editor toolbar and text area
    $('#summernote').summernote({
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture']],
            ['misc', ['codeview']]
        ],
        callbacks: {
            onImageUpload: function (files) {
                Template.create.handleFiles(files);
            }
        },
        height: 350,
        placeholder : "Your post here..."
    });

    // Saving the post body for the preview part
    $('#summernote').on('summernote.change', function()
    {
      body = $('#summernote').summernote('code')
      body= body.replace(/\&lt;sc.*\&gt;[\w\W]{1,}(.*?)[\w\W]{1,}&lt;\/pt\&gt;/gi, "");
      Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body));
    });

    // Saving the post tags for the post preview method
    $('#tags').on('change',function()
    {
      Session.set('preview-tags',document.getElementById('newarticle').tags.value)
    });

    // Rules for validating the form
    $('#newarticle').form({
        on: 'blur',
        fields: {
          title: {
            identifier: 'title',
            rules: [
              {
                type: 'empty',
                prompt: translate('COMMON_TYPE_A_TITLE')
              },
              {
                type: 'minLength[5]',
                prompt: translate('COMMON_AT_LEAST_FIVECHAR')
              }
            ]
          },
          summernote: {
            identifier: 'summernote',
            rules: [
              {
                type: 'empty',
                prompt: translate('COMMON_TYPE_DESCRIPTION')
              }
            ]
          }
        }
      })
}


// Control of the different buttons
Template.create.events(
{
  // Submit
  'click .ui.button.submit': function (event)
  {
    event.preventDefault()
    if ($('#newarticle').form('is valid'))
    {
      $('#newarticle').form('validate form')
      $('.ui.button.submit').addClass('loading')
      var project = Template.create.createProject(document.getElementById('newarticle'))
      Template.create.submitproject(project)
    }
    else { $('#newarticle').form('validate form') }
  },

  // Add beneficiary
  'click .ui.button.add-beneficiary': function (event)
  {
    Session.set('beneficiary-edit',false)
    event.preventDefault()
    draft ={}
    draft.title = document.getElementById('newarticle').title.value
    draft.body = document.getElementById('newarticle').body.value
    draft.tags= document.getElementById('newarticle').tags.value
    draft.beneficiaries= document.getElementById('newarticle').beneficiaries.value
    if(draft.beneficiaries!='')
    {
      beneficiary_array = draft.beneficiaries.split(',')
      beneficiary_array =beneficiary_array.reduce(function(result, value, index, array)
      {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      }, []);
      draft.beneficiaries = beneficiary_array
    }
    $('.ui.beneficiary.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.beneficiarymodal, {data:this}));
    $('.ui.beneficiary.modal').modal('setting', 'transition', 'scale').modal('show')
    Session.set('beneficiary','')
    Session.set('shares','')
    Session.set('current-draft', draft)
    Template.beneficiarymodal.init()
  },

  // Reset button (unused)
  'click .ui.button.reset': function (event)
  {
    var form = document.getElementById('newarticle')
    form.title.value = ''
    form.title.placeholder = 'Type your title'
    var markupStr = 'Your post here...';
    $('#summernote').summernote('code', markupStr);
    $('.ui.multiple.dropdown').dropdown('clear');
    event.preventDefault()
  },

  // Save draft
  'click .ui.button.save': function (event)
  {
    event.preventDefault()
    Template.drafts.addToDraft(document.getElementById('newarticle'))
  },

  // Edit an existing beneficiary
  'click #edit-beneficiary': function(event)
  {
    Session.set('beneficiary-edit',true)
    event.preventDefault()
    draft ={}
    draft.title = document.getElementById('newarticle').title.value
    draft.body = document.getElementById('newarticle').body.value
    draft.tags= document.getElementById('newarticle').tags.value
    draft.beneficiaries= document.getElementById('newarticle').beneficiaries.value
    if(draft.beneficiaries!='')
    {
      beneficiary_array = draft.beneficiaries.split(',')
      beneficiary_array =beneficiary_array.reduce(function(result, value, index, array)
      {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      }, []);
      draft.beneficiaries = beneficiary_array
    }
    $('.ui.beneficiary.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.beneficiarymodal, {data:this}));
    $('.ui.beneficiary.modal').modal('setting', 'transition', 'scale').modal('show')

    var beneficiary = event.target.getAttribute('name').split('-')
    var current_benef = beneficiary
    var current_share = beneficiary.pop()
    Session.set('beneficiary',current_benef.join('-'))
    Session.set('shares',current_share)
    Session.set('current-draft', draft)
    Template.beneficiarymodal.init()
  },

  // Removing an existing beneficiary
  'click #remove-beneficiary': function(event)
  {
    event.preventDefault()
    draft ={}
    draft.title = document.getElementById('newarticle').title.value
    draft.body = document.getElementById('newarticle').body.value
    draft.tags= document.getElementById('newarticle').tags.value
    draft.beneficiaries= document.getElementById('newarticle').beneficiaries.value
    if(draft.beneficiaries!='')
    {
      beneficiary_array = draft.beneficiaries.split(',')
      beneficiary_array =beneficiary_array.reduce(function(result, value, index, array)
      {
        if (index % 2 === 0) result.push(array.slice(index, index + 2));
        return result;
      }, []);
      draft.beneficiaries = beneficiary_array
    }

    var beneficiary = event.target.getAttribute('name')
    draft.beneficiaries = draft.beneficiaries.filter( (x) => { return x[0]!==beneficiary; });
    document.getElementById('newarticle').beneficiaries.value = draft.beneficiaries
    Session.set('current-draft', draft)
  }
})

// Getting the meta data of the post to submit on the blockchain
Template.create.createProject = function(form)
{
  var permlink;
  var title = form.title.value
  var body = form.body.value
  var tags = form.tags.value
  var beneficiaries = form.beneficiaries.value
  if(beneficiaries!='')
  {
    beneficiary_array = beneficiaries.split(',')
    beneficiary_array =beneficiary_array.reduce(function(result, value, index, array)
    {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);
    beneficiaries = beneficiary_array
  }
  beneficiaries_dico = []
  for (i=0; i < beneficiaries.length; i++)
    beneficiaries_dico.push({ account: beneficiaries[i][0], weight: parseInt(beneficiaries[i][1])*100 })
  beneficiaries_dico.sort(function(a,b){
    if(a["account"] < b["account"]) {return -1}
    else { return 1}
   });

  // Getting the tags
  if(tags=="") { tags=['steemstem'] }
  else         { tags = tags.split(','); tags.unshift('steemstem') }

  if(sessionStorage.editpermlink) { permlink = sessionStorage.editpermlink }
  else
  {
        permlink = title.replace(/[^a-zA-Z0-9]/g,' ')
        permlink = permlink.replace(/\s+/g, '-').toLowerCase().slice(0,20)
        permlink = permlink+'-'+(Math.round((new Date()).getTime() / 1000)).toString();
  }
  var author = localStorage.username
  var json_metadata = {
    tags: tags,
    app: 'steemstem'
  }

  // Rest
  if(sessionStorage.editpermlink)
  {
    permlink =  sessionStorage.editpermlink
    var percent_steem_dollars = 10000
    var project_to_publish = [
      ['comment',
        {
          parent_author: '',
          parent_permlink: tags[0],
          author: author,
          permlink: projectnumber,
          title: title,
          body: body,
          json_metadata: JSON.stringify(json_metadata)
        }
      ]
    ];
    return project_to_publish
  }
  else
  {
    var percent_steem_dollars = 10000
    if(beneficiaries_dico.length==0)
    {
      project_to_publish = [
        ['comment',
          {
             parent_author: '', parent_permlink: tags[0], author: author, permlink: permlink, title: title,
             body: body, json_metadata: JSON.stringify(json_metadata)
          }
        ],
        ['comment_options',
          {
             author: author, permlink: permlink, max_accepted_payout: '1000000.000 SBD',
             percent_steem_dollars: percent_steem_dollars, allow_votes: true, allow_curation_rewards: true,
             extensions: []
          }
        ]
      ];
      return project_to_publish
    }
    else
    {
      var project_to_publish = [
        ['comment',
          {
            parent_author: '', parent_permlink: tags[0], author: author, permlink: permlink, title: title,
            body: body, json_metadata: JSON.stringify(json_metadata)
          }
        ],
        ['comment_options',
          {
            author: author, permlink: permlink, max_accepted_payout: '1000000.000 SBD',
            percent_steem_dollars: percent_steem_dollars, allow_votes: true, allow_curation_rewards: true,
            extensions: [  [0, { beneficiaries: beneficiaries_dico } ]  ]
          }
        ]
      ];
      return project_to_publish
    }

  }
}


// Load the draft content in the posting form
Template.create.loadDraft = function (draft)
{
  var form = document.getElementById('newarticle')
  form.title.value = draft.title
  $('#summernote').summernote('code', draft.body);
  $('.ui.multiple.dropdown').dropdown('clear');
  var tagsarray = draft.tags.split(',')
  var ntags=0
  if (tagsarray.length > 1)
  {
    for (i = 0; i < tagsarray.length; i++)
    {
      if(tagsarray[i]!='steemstem') { ntags++ }
      if(ntags==10)
      {
        $(".ui.multiple.dropdown").dropdown("set selected", tagsarray[i])
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions',false);
        $('.to.message.yellow').removeClass('hidden');
        $('.to.message.yellow').addClass('visible');
      }
      else
      {
         $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions',true);
         $(".ui.multiple.dropdown").dropdown("set selected", tagsarray[i])
      }
    }
  }
  else { $('.ui.multiple.dropdown').dropdown("set selected", draft.tags) }
  form.beneficiaries.value = draft.beneficiaries
  Session.set('loaded-draft', draft)
  if(draft.beneficiaries!='')
  {
    beneficiary_array = draft.beneficiaries.split(',')
    beneficiary_array =beneficiary_array.reduce(function(result, value, index, array)
    {
      if (index % 2 === 0) result.push(array.slice(index, index + 2));
      return result;
    }, []);
    draft.beneficiaries = beneficiary_array
  }
  Session.set('current-draft',draft)
  event.preventDefault()
}


// Submit the post
Template.create.submitproject = function (project)
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
      Session.set('isonedit', 'false')
      Session.set('editlink', '')
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) { if ((new Date().getTime() - start) > 1000) { break; } }
      FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink)
      FlowRouter.reload()
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
        Session.set('isonedit', 'false')
        Session.set('editlink', '')
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) { if ((new Date().getTime() - start) > 1000) { break; } }
        FlowRouter.go('#!/@' + project[0][1].author + '/' + project[0][1].permlink)
        FlowRouter.reload()
      }
      $('.ui.button.submit').removeClass('loading')
      return true
    });
  }
}

// To upload a file in the steemstem cloud (images)
const cloudName = 'drrz8xekm';
const unsignedUploadPreset = 'steemstem';

Template.create.uploadFile = function (file)
{
  var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  var xhr = new XMLHttpRequest();
  var fd = new FormData();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.upload.addEventListener("progress", function (e)
  {
    console.log(`fileuploadprogress data.loaded: ${e.loaded},data.total: ${e.total}`);
    if (e.loaded === e.total) { }
  });
  xhr.onreadystatechange = function (e)
  {
    if (xhr.readyState == 4 && xhr.status == 200)
    {
      var response = JSON.parse(xhr.responseText);
      console.log(response)
      var url = response.secure_url;
      var tokens = url
      var img = new Image();
      img.src = tokens
      img.alt = response.public_id;
      console.log(img)
      $('#summernote').summernote('insertImage', img.src, img.alt);
    }
  };
  fd.append('upload_preset', unsignedUploadPreset);
  fd.append('tags', 'browser_upload');
  fd.append('file', file);
  xhr.send(fd);
}

// Handling file upload
Template.create.handleFiles = function (files)
{
  for (var i = 0; i < files.length; i++) { Template.create.uploadFile(files[i]); }
};

Template.create.helpers(
{
  // Loading the list with all beneficiaries attached to a post 
  loadBeneficiaries: function()
  {
    draft = Session.get('current-draft')
    if(draft) { return draft.beneficiaries }
  },

  // Function allowing to display a single beneficiary
  DisplayBeneficiary: function(beneficiary) { return beneficiary[0] },

  // Function allowing to display a share of a single beneficiary
  DisplayShare: function(beneficiary) { return beneficiary[1] },

  // Function allowing to display the post title for the preview part
  DisplayPostTitle: function() { return Session.get('preview-title') },

  // Function to display the post body for the preview part
  DisplayPostBody: function()  { return Session.get('preview-body'); },

  // Function to display the post tagsfor the preview part
  DisplayPostTags: function()
  {
    tags = Session.get('preview-tags').split(',');
    if(tags=='') { return ['steemstem'] }
    if(!tags.includes('steemstem'))
      tags.unshift('steemstem')
    return tags
  }
})

