// Rendering
Template.steemkeychainmodal.rendered = function () { }

// Modal initialization
Template.steemkeychainmodal.init = function ()
{
  $("#steem_id").change(function ()
  {
    steem.api.lookupAccountNames([$("#steem_id").val()], function (error, result)
    {
      if(result[0]===null)
      {
        $(".to.message.green").addClass('hidden')
        $(".to.message.red").removeClass('hidden')
        $("#confirmlogin").addClass('disabled')
      }
      else
      {
        $(".to.message.green").removeClass('hidden')
        $(".to.message.red").addClass('hidden')
        $("#confirmlogin").removeClass('disabled')
      }
    });
  });

  // Submit button
  document.getElementById("confirmlogin").addEventListener("click", ConfirmLogin);

  // Confirm login via steemkeychain
  function ConfirmLogin()
  {
    let keychain = window.steem_keychain;
    keychain.requestSignBuffer($("#steem_id").val(), "#SteemSTEM", "Posting", function(resp)
    {
       if(resp.success)
       {
         localStorage.setItem('username', $("#steem_id").val());
         localStorage.setItem('kc', 'true');
         MainUser.add(localStorage.username, function(error) {});
         $('.ui.steemkeychain.modal').modal('hide');
       }
       else
       {
         $(".error.message.red").removeClass('hidden');
         console.log('steem keychain login error:', resp.error);
       }
    });
  }
}

// Events
Template.steemkeychainmodal.events({ })


// Helpers
Template.steemkeychainmodal.helpers(
{
    // Is key chain available
    SteemKeychain: function () { return window.steem_keychain; }
});
