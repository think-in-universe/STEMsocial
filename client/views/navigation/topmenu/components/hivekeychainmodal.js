// Rendering
Template.hivekeychainmodal.rendered = function () { }

// Modal initialization
Template.hivekeychainmodal.init = function ()
{
  $("#hive_id").change(function ()
  {
    hive.api.lookupAccountNames([$("#hive_id").val()], function (error, result)
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

  // Confirm login via hivekeychain
  function ConfirmLogin()
  {
    let keychain = window.hive_keychain;
    keychain.requestSignBuffer($("#hive_id").val(), "#STEMsocial", "Posting", function(resp)
    {
       if(resp.success)
       {
         localStorage.setItem('username', $("#hive_id").val());
         localStorage.setItem('kc', 'true');
         MainUser.add(localStorage.username, function(error) {});
         $('.ui.hivekeychain.modal').modal('hide');
       }
       else
       {
         $(".error.message.red").removeClass('hidden');
         console.log('Hive-keychain login error:', resp.error);
       }
    });
  }
}

// Events
Template.hivekeychainmodal.events({ })


// Helpers
Template.hivekeychainmodal.helpers(
{
    // Is key chain available
    HiveKeychain: function () { return window.hive_keychain; }
});
