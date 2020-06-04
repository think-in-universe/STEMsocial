// Rendering
Template.deletemodal.rendered = function () { }

// Events
Template.deletemodal.events({ });

// Initializastion of the vote modal
Template.deletemodal.init = function ()
{

  // Confirm button
  document.getElementById("confirmdelete").addEventListener("click", CommentDelete);


  function CommentDelete()
  {
    // comment info
    $("#confirmdelete").addClass('loading');
    let author          = $("#confirmdelete").attr("author");
    let permlink        = $("#confirmdelete").attr("permlink");
    let json            = ['delete_comment',{ author:author,permlink:permlink}];
    let parent_author   = $("#confirmdelete").attr("parent_author");
    let parent_permlink = $("#confirmdelete").attr("parent_permlink");

    HiveConnect(['delete', localStorage.username, [json], 'Posting', parent_author, parent_permlink], function(response)
    {
      // Updating the buttons
      $("#confirmdelete").removeClass('loading');

      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything is fine -> removing the comment/post from the database
      if(parent_author && parent_permlink) Comments.remove({author:author, permlink:permlink});
      else Content.remove({author:author, permlink:permlink});

      // Database update
      if( Comments.findOne({author:parent_author, permlink:parent_permlink}))
      {
        let mother = Comments.findOne({author:parent_author, permlink:parent_permlink});
        Comments.update({author:parent_author, permlink:parent_permlink}, {$set: {children:mother.children-1}});
      }

      // Buttons
      $("#confirmdelete").removeClass('loading');
      $('.ui.delete.modal').modal('hide');
    });
  }
}

