// Rendering
Template.deletemodal.rendered = function () { }

// Events
Template.deletemodal.events({ });

// Initializastion of the vote modal
Template.deletemodal.init = function ()
{

  // Confirm button
  document.getElementById("confirmdelete").addEventListener("click", CommentDelete);

  // Update the post information after a deletion
  function UpdatePostInfo(parent_author, parent_permlink)
  {
    // Database update
    if( Comments.findOne({author:parent_author, permlink:parent_permlink}))
    {
      let mother = Comments.findOne({author:parent_author, permlink:parent_permlink});
      Comments.update({author:parent_author, permlink:parent_permlink}, {$set: {children:mother.children-1}});
    }

    // Buttons
    $("#confirmdelete").removeClass('loading');
    $('.ui.delete.modal').modal('hide');
  }


  function CommentDelete()
  {
    // comment info
    $("#confirmdelete").addClass('loading');
    let author          = $("#confirmdelete").attr("author");
    let permlink        = $("#confirmdelete").attr("permlink");
    let json            = ['delete_comment',{ author:author,permlink:permlink}];
    let parent_author   = $("#confirmdelete").attr("parent_author");
    let parent_permlink = $("#confirmdelete").attr("parent_permlink");

    if (localStorage.kc)
    {
      window.hive_keychain.requestBroadcast(localStorage.username, [json], 'Posting', function(response)
      {
        // Error
        if(!response.success)
        {
          console.log('Error with keychain (delete comment)', json, response);
          $("#confirmdelete").removeClass('loading');
          return;
        }

        // Everything is fine -> removing the comment/post from the database
        if(parent_author && parent_permlink)
          Comments.remove({author:author, permlink:permlink});
        else
          Content.remove({author:author, permlink:permlink});

        // Updating the mother comment and the buttons
        UpdatePostInfo(parent_author, parent_permlink);
      });
    }
    else
    {
      hivesigner.deleteComment(parent_author, parent_permlink, author, permlink, function (error, result)
      {
        // Error
        if (error)
        {
          console.log('Error with hivesigner (delete comment)', error, result);
          $("#confirmdelete").removeClass('loading');
          return;
        }

        // Everything is fine -> removing the comment/post from the database
        if(parent_author && parent_permlink)
          Comments.remove({author:author, permlink:permlink});
        else
          Content.remove({author:author, permlink:permlink});

        // Updating the mother comment and the buttons
        UpdatePostInfo(parent_author, parent_permlink);
      });
    }
  }
}

