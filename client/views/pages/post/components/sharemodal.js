// No rendering
Template.sharemodal.rendered = function() { }

// Modal initialization
Template.sharemodal.init = function(author, permlink)
{
  // buttons
  document.getElementById("reblog").addEventListener("click", Proceed);

  // Submit button
  function Proceed()
  {
    if (localStorage.kc)
    {
      let json = JSON.stringify(['reblog', { account: localStorage.username, author: author, permlink: permlink }]);
      window.hive_keychain.requestCustomJson(localStorage.username, "follow", "Posting", json, "reblog", function(response)
        { console.log(response);});
    }
    else
    {
      hivesigner.reblog(author, permlink, function (error, result) { if (error) { console.log(error); return; } });
      $('.ui.share.modal.'+permlink).modal('close');
    }
  }
}

// No events
Template.sharemodal.events({ })
