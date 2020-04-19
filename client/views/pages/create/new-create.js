// Rendering of the page
Template.newcreate.rendered = function () {

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
};


// Control of the different buttons
Template.newcreate.events({ });

// Helpers 
Template.newcreate.helpers({
  // Function allowing to display the post title for the preview part
  DisplayPostTitle: function() { return Session.get('preview-title') },

  // Function to display the post body for the preview part
  DisplayPostBody: function()  { return Session.get('preview-body'); }
});

