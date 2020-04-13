// Rendering
Template.article.rendered = function () {
  // Post rendering
  Deps.autorun(function () {
    sleep(500)
    $('article').visibility(
    {
      once: false,
      // update size when new content loads
      observeChanges: true,
      // load content on bottom edge visible
      onBottomVisible: function ()
      {
        // loads a max of 5 times 
        if(!Comments.findOne({ 'parent_permlink': Session.get('article') }))
          Comments.loadComments(Session.get('user'), Session.get('article'));
      }
    });
  });
}

// Set of helper methods to be used in the HTML document
Template.article.helpers(
{
    // Return true or false depending whether we are in the edit mode
    isOnEdit   : function()
    {
      var cond1=Session.get('isonedit'); if(!cond1) {cond1=false;}
      var cond2 = (Session.get('editlink')==Session.get('article')); if(!cond2) {cond2=false;}
      return (cond1&&cond2)
    },

    // This gets the post content and sets it into the edition form
    loadNote   : function(posttitle, postbody, tagsarray, postbnf)
    {
      $(document).ready(function()
      {
        // Saving the post for the preview mode
        Session.set('preview-title', posttitle)
        Session.set('preview-body',  Blaze._globalHelpers['ToHTML'](postbody));
        Session.set('preview-bnf',  postbnf)

        // Title change when editting
        $('#title').on('input',function()
          { Session.set('preview-title',document.getElementById('newarticle').title.value) });

        // Initializing the WYSIWYG editor
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
          callbacks:
           {onImageUpload: function (files) { Template.create.handleFiles(files);}},
          height: 350
        });

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
        });


        // Saving the post body for the preview part
        $('#summernote').on('summernote.change', function()
        {
          body = $('#summernote').summernote('code')
          body = body.replace(/\&lt;sc.*\&gt;[\w\W]{1,}(.*?)[\w\W]{1,}&lt;\/pt\&gt;/gi, "");
          Session.set('preview-body', Blaze._globalHelpers['ToHTML'](body));
        });

        // Saving the post tags for the post preview method
        $('#tags').on('change',function()
        {
          Session.set('preview-tags',document.getElementById('newarticle').tags.value)
        });

        // Loading the post body
        if(postbody) $('#summernote').summernote('code', postbody);

        // Taking care of the initialisation of the tag list
        $('.ui.multiple.dropdown').dropdown({
          allowAdditions: true,
          keys: {  delimiter: 32, },
          onNoResults: function (search) {},
          onChange: function () {
            var tags = $('#tags').attr('value').split(",").length;
            if($('#tags').attr('value').split(',').includes('steemstem'))
              tags--
            if($('#tags').attr('value').split(',').includes('hive-196387'))
              tags--
            if (tags <= 10)
              $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', true);
            else if (tags>10) {
              $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions', false);
              $('.to.message.yellow').removeClass('hidden');
              $('.to.message.yellow').addClass('visible');
            }
          }
        });
        $('.ui.multiple.dropdown').dropdown('clear');
        var ntags=0
        if(tagsarray!=null)
        {
          for (i = 0; i < tagsarray.length; i++)
          {
            if(!['steemstem', 'hive-196387'].includes(tagsarray[i]))
            {
              ntags++
              if(ntags>10)
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
        }
        $('.ui.multiple.dropdown').dropdown('setting', 'allowAdditions',true);
      })
    },

    // Loading the comments
    loadComments: function()
    {
      comments = Comments.find({ 'parent_permlink': Session.get('article')}).fetch()
      if(comments) {return comments }
    },

  // Function allowing to display the post title for the preview part
  DisplayPostTitle: function() { return Session.get('preview-title') },

  // Function to display the post body for the preview part
  DisplayPostBody: function() { return Session.get('preview-body'); },

  // Function to display the post tagsfor the preview part
  DisplayPostTags: function()
  {
    tags = Session.get('preview-tags')
    if(tags) { tags = tags.split(',') }
    else     { tags =  ['hive-196387']  }
    if(!tags.includes('hive-196387'))  { tags.unshift('hive-196387') }
    return tags
  },

  // Loading the list with all beneficiaries attached to a post 
  loadBeneficiaries: function()
  {
     bnf = Session.get('preview-bnf')
     if(bnf)
     {
       beneficiary_array = []
       for (i=0; i < bnf.length; i++)
         beneficiary_array.push([bnf[i]['account'], bnf[i]['weight']/100])
       beneficiary_array.sort(function(b,a){ return(a[1]-b[1]);})
       for (i=0; i < beneficiary_array.length; i++)
       {
         if(i<beneficiary_array.length-1)
           beneficiary_array[i][1]='('+beneficiary_array[i][1].toString()+"%); "
         else
           beneficiary_array[i][1]='('+beneficiary_array[i][1].toString()+"%)."
       }
       return beneficiary_array
     }
  },

  // Function allowing to display a single beneficiary
  DisplayBeneficiary: function(beneficiary) { return beneficiary[0]},

  // Function allowing to display a share of a single beneficiary
  DisplayShare: function(beneficiary) { return beneficiary[1]}
})


// Allow to wait a little bit before executing a script
function sleep(milliseconds)
{
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) { if ((new Date().getTime() - start) > milliseconds) { break; } }
}

// Post edition: definition of the buttons
Template.article.events(
{
  // Cancel
  'click .ui.button.reset': function(event)
  {
    Session.set('isonedit', 'false')
    Session.set('editlink', '')
    FlowRouter.reload();
  },

  // Submit
  'click .submit-article-action': function (event)
  {
    event.preventDefault()
    if ($('#newarticle').form('is valid'))
    {
      $('#newarticle').form('validate form')
      document.getElementById('submit-article-button').classList.add('loading')
      var project = Template.article.UpdateProject(document.getElementById('newarticle'))
      if(project) { Template.create.submitproject(project); }
    }
    else { $('#newarticle').form('validate form') }
  }

})

// Getting the meta data of the post to submit on the blockchain
Template.article.UpdateProject = function(form)
{
  old_content = Content.findOne({ 'permlink': Session.get('article') })
  tags = form.tags.value
  if(tags=="") { tags=['hive-196387'] }
  else         { tags = tags.split(','); tags.unshift('hive-196387') }

  if(old_content)
  {
    old_content.json_metadata.tags  = tags;
    var project_to_edit = [
      ['comment',
        {
          parent_author   : old_content.parent_author,
          parent_permlink : old_content.parent_permlink,
          author          : old_content.author,
          permlink        : old_content.permlink,
          title           : form.title.value,
          body            : form.body.value,
          json_metadata   : JSON.stringify(old_content.json_metadata)
        }
      ]
    ];
    return project_to_edit
  }
}


