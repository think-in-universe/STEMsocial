// No rendering
Template.beneficiarymodal.rendered = function () {  }

// Initialization of the transfer form
Template.beneficiarymodal.init = function (bnf,shr)
{
  // Initialization (check whether it is a new beneficiary)
  if(bnf!=='' && shr!=='')
  {
    document.getElementById('my-beneficiary').value = bnf;
    $("#my-beneficiary").prop('disabled', 'true')
    $(".to.message.green").removeClass('hidden')
    $("#shares").prop('disabled', false)
    document.getElementById('shares').value = shr;
    $("#confirm-beneficiary").removeClass('disabled')
  }

  // The beneficiary field
  $("#my-beneficiary").change(function ()
  {
    hive.api.lookupAccountNames([$("#my-beneficiary").val()], function (error, result)
    {
      if(!result[0])
      {
        $(".to.message.green").addClass('hidden');
        $(".to.message.red").removeClass('hidden');
        $("#shares").prop('disabled', true);
        $("#confirm-beneficiary").addClass('disabled');
      }
      else
      {
        $(".to.message.green").removeClass('hidden');
        $(".to.message.red").addClass('hidden');
        $("#shares").prop('disabled', false);
      }
    });
  });

  // Control of the share field
  $("#shares").change(function ()
  {
    if( (parseFloat($("#shares").val())>0) && (parseFloat($("#shares").val())<=100) )
    {
      $(".shares.message.red").addClass('hidden')
      $("#confirm-beneficiary").removeClass('disabled');
    }
    else
    {
      $(".shares.message.red").removeClass('hidden');
      $("#confirm-beneficiary").addClass('disabled');
    }
  });

  // Submit button
  document.getElementById("confirm-beneficiary").addEventListener("click", AddBeneficiary);

  // Sending the required operation to the main page
  function AddBeneficiary()
  {
      let json={}; if(Session.get('preview-beneficiaries')) json=JSON.parse(Session.get('preview-beneficiaries'));
      json[$("#my-beneficiary").val()] = parseFloat($("#shares").val());
      Session.set('preview-beneficiaries', JSON.stringify(json));
      $('.ui.beneficiary.modal').modal('hide');
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
    if(Session.get('beneficiary-edit')==true) return 'Update';
    else return 'Add';
  }
})

