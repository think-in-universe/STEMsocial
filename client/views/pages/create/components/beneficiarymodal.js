// No rendering
Template.beneficiarymodal.rendered = function () { }

// Initialization of the transfer form
Template.beneficiarymodal.init = function ()
{
  // Initialization
  if(Session.get('beneficiary')!=='')
  {
    document.getElementById('my-beneficiary').value = Session.get('beneficiary')
    $("#my-beneficiary").prop('disabled', 'true')
    $(".to.message.green").removeClass('hidden')
    $("#shares").prop('disabled', false)
  }
  if(Session.get('shares')!=='')
  {
    document.getElementById('shares').value = Session.get('shares')
    $("#confirm-beneficiary").removeClass('disabled')
  }

  // The beneficiary field
  $("#my-beneficiary").change(function ()
  {
    steem.api.lookupAccountNames([$("#my-beneficiary").val()], function (error, result)
    {
      if (result[0] === null)
      {
        $(".to.message.green").addClass('hidden')
        $(".to.message.red").removeClass('hidden')
        $("#shares").prop('disabled', true);
        $("#confirm-beneficiary").addClass('disabled')
      }
      else
      {
        $(".to.message.green").removeClass('hidden')
        $(".to.message.red").addClass('hidden')
        $("#shares").prop('disabled', false);
        Session.set('beneficiary',$("#my-beneficiary").val())
      }
    });
  });

  // Control of the share field
  $("#shares").change(function ()
  {
    if( (parseFloat($("#shares").val())>0) && (parseFloat($("#shares").val())<=100) )
    {
      $(".shares.message.red").addClass('hidden')
      Session.set('shares',$("#shares").val())
      if(Session.get('shares') && Session.get('beneficiary'))
        { $("#confirm-beneficiary").removeClass('disabled') }
    }
    else
    {
      $(".shares.message.red").removeClass('hidden')
      $("#confirm-beneficiary").addClass('disabled')
    }
  });

  // Submit button
  document.getElementById("confirm-beneficiary").addEventListener("click", AddBeneficiary);

  // Sending the required operation to steemconnect
  function AddBeneficiary()
  {
    if(Session.get('beneficiary')!='' && Session.get('shares')!='')
    {
      draft = Session.get('current-draft')
      if(draft.beneficiaries=='') {  draft.beneficiaries=[] }
      draft.beneficiaries = draft.beneficiaries.filter( (x) => { return x[0]!==Session.get('beneficiary'); });
      draft.beneficiaries.push([Session.get('beneficiary'), Session.get('shares') ])
      Session.set('current-draft', draft)
      document.getElementById('newarticle').beneficiaries.value = draft.beneficiaries
      $('.ui.beneficiary.modal').modal('hide')
    }
  }
}

// No events
Template.beneficiarymodal.events({ })

// Helpers
Template.beneficiarymodal.helpers(
{
  // Get the right word in the confirm button
  AddButtonValue: function()
  {
    if(Session.get('beneficiary-edit'))  { return 'Update' }
    else { return 'Add' }
  }
})

