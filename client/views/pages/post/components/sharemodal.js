// Modal initialization
Template.sharemodal.init = function(author, permlink)
{
  // buttons
  document.getElementById("reblog").addEventListener("click", Proceed);

  // Submit button
  function Proceed()
  {
    let json = JSON.stringify(['reblog', { account: localStorage.username, author: author, permlink: permlink }]);
    HiveConnect(['reblog', localStorage.username, 'follow', 'Posting', json, 'reblog'], function(response)
    {
      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything is fine
      $('.ui.share.modal.'+permlink).modal('close');
    });
  }
}
