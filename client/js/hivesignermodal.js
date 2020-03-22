// No rendering
Template.hivesignermodal.rendered = function() { }

// Modal initialization
Template.hivesignermodal.init = function()
{
  // buttons
  document.getElementById("proceed").addEventListener("click", Proceed);

  // Submit button
  function Proceed()
  {
    event.preventDefault()
    window.location.href = sc2.getLoginURL(sessionStorage.currentroute+
     '----ssio----'+localStorage.sc2_command)
  }
}

// No events
Template.hivesignermodal.events({ })
