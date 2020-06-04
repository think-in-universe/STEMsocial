// Helpers
Template.hiveconnectmodal.helpers({
  // Error information
  connect_mediator: function() { return Session.get('connect_mediator'); },
  connect_error   : function() { return Session.get('connect_error'); },
  connect_message : function() { return Session.get('connect_message'); }
});

// Initializastion of the vote modal
Template.hiveconnectmodal.init = function (response)
{
  // Confirm button
  document.getElementById("okconnect").addEventListener("click", OKConnect);

  // OK -> removing the modal
  function OKConnect() { $('.ui.hiveconnect.modal').modal('hide'); }
}

