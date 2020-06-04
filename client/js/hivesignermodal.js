// Modal initialization
Template.hivesignermodal.init = function()
{
  // buttons
  document.getElementById("proceed").addEventListener("click", Proceed);

  // Submit button
  function Proceed() { window.location.href = sc2.getLoginURL(); }
}
