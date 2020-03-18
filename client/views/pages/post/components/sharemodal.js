// No rendering
Template.sharemodal.rendered = function() { }

// Modal initialization
Template.sharemodal.init = function(author, permlink)
{
  // buttons
  document.getElementById("resteem").addEventListener("click", Proceed);

  // Submit button
  function Proceed()
  {
    if (localStorage.kc)
    {
      let json = JSON.stringify(['reblog', { account: localStorage.username, author: author, permlink: permlink }]);
      window.steem_keychain.requestCustomJson(localStorage.username, "follow", "Posting", json, "resteem", function(response)
        { console.log(response);});
    }
    else
    {
      steemconnect.reblog(author, permlink, function (error, result) { if (error) { console.log(error); return; } });
      $('.ui.share.modal.'+permlink).modal('close');
    }
  }
}

// No events
Template.sharemodal.events({ })
