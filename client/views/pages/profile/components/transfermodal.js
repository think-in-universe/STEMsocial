// No rendering
Template.transfermodal.rendered = function () { }

// Helpers
Template.transfermodal.helpers(
{
  // Is the memo field needed
  NeedsMemo: function()
  {
    if(['hive-transfer', 'hive-savingtransfer', 'hbd-transfer', 'hbd-savingtransfer','fromsavings-hive', 'fromsavings-hbd'].includes(this.data.current_op)) {return true}
    return false
  },

  // Is the 'to' field needed?
  NeedsTo: function()
  {
    if(['powerdown'].includes(this.data.current_op)) {return false}
    return true
  },

  // Do we need to calculate the balance from the available HP
  NeedsHPBalance: function()
  {
    if(['powerdown', 'delegate'].includes(this.data.current_op)) {return  true}
    return false
  },

  // Do we need to calculate the balance from the available liquid HIVE tokens
  NeedsHiveBalance: function()
  {
    if(['hive-transfer', 'hive-savingtransfer', 'powerup'].includes(this.data.current_op)) {return true}
    return false
  },

  // Do we need to calculate the balance from the available HBD tokens
  NeedsHBDBalance: function()
  {
    if(['hbd-transfer', 'hbd-savingtransfer'].includes(this.data.current_op)) {return true}
    return false
  },

   // Do we need to calculate the balance from the HBD tokens avaialble in savings
  NeedsHBDSavingsBalance: function()
  {
    if(['fromsavings-hbd'].includes(this.data.current_op)) {return true}
    return false
  },

   // Do we need to calculate the balance from the available HBD tokens
  NeedsHiveSavingsBalance: function()
  {
    if(['fromsavings-hive'].includes(this.data.current_op)) {return true}
    return false
  },

  // Title of the operation
  OperationTitle: function()
  {
    var title=''
    switch(this.data.current_op)
    {
      case 'hive-transfer':       title="HIVE wallet transfer"; break;
      case 'hive-savingtransfer': title="HIVE transfer to savings"; break;
      case 'fromsavings-hive':    title="Withdraw HIVE from savings"; break;
      case 'hbd-transfer':        title="HBD wallet transfer"; break;
      case 'hbd-savingtransfer':  title="HBD transfer to savings"; break;
      case 'fromsavings-hbd':     title="Withdraw HBD from savings"; break;
      case 'powerup':             title="Convert to HIVE POWER."; break;
      case 'powerdown':           title="Withdraw HIVE POWER."; break;
      case 'delegate':            title="Delegate HIVE POWER."; break;
    }
    return title
  },

  // The help message concerning the amount to provide
  OperationAmountClass: function()
  {
    var AmountClass = 'Amount to transfer'
    switch(this.data.current_op)
    {
      case 'powerdown': AmountClass="Amount to Power Down"; break;
      case 'delegate': AmountClass="Amount to delegate"; break;
      case 'fromsavings-hbd':
      case 'fromsavings-hive': AmountClass="Amount to withdraw"; break;
    }
    return AmountClass
  },

  // Description of the operation
  OperationDescr: function()
  {
    var descr=''
    switch(this.data.current_op)
    {
      case 'hive-transfer':
        descr="Move HIVE funds to another Hive account."
        break;
      case 'hive-savingtransfer':
        descr="Move HIVE funds to a saving account (protect funds by requiring a three-day withdraw waiting period)."
        break;
      case 'powerup':
        descr="HIVE POWER is non-transferable and requires 13 weeks to be converted back to HIVE."
        break;
      case 'powerdown':
        descr="Set up a HIVE POWER withdrawal (1/13 of the powered down amount to be withdrawn once every week during 13 weeks)."
        break;
      case 'delegate':
        descr="Delegate HIVE POWER to another Hive account. Delegated HIVE POWER can be recovered 5 days after undelegating."
        break;
      case 'hbd-transfer':
        descr="Move HBD funds to another Hive account."
        break;
      case 'hbd-savingtransfer':
        descr="Move HBD funds to a saving account (protect funds by requiring a three-day withdraw waiting period)."
        break;
      case 'fromsavings-hive':
        descr="Withdraw HIVE funds from a saving account (a three-day withdraw waiting period is required)."
        break;
      case 'fromsavings-hbd':
        descr="Withdraw HBD funds from a saving account (a three-day withdraw waiting period is required)."
        break;
    }
    return descr
  }
})

// Initialization of the transfer form
Template.transfermodal.init = function (operation)
{
  // Init
  Session.set('to',false)
  Session.set('amount','')
  Session.set('memo','')

  // The destination field
  if(['fromsavings-hbd', 'fromsavings-hive', 'hbd-transfer', 'hbd-savingtransfer', 'hive-transfer', 'hive-savingtransfer', 'delegate', 'powerup'].includes(operation))
  {
    $("#to").change(function ()
    {
      hive.api.lookupAccountNames([$("#to").val()], function (error, result)
      {
        if (result[0] === null)
        {
          $(".to.message.green").addClass('hidden')
          $(".to.message.red").removeClass('hidden')
          $("#amount").prop('disabled', true);
          $("#memo").prop('disabled', true);
          $("#addbalance").addClass('disabled')
          $("#confirmtransfer").addClass('disabled')
        }
        else
        {
          $(".to.message.green").removeClass('hidden')
          $(".to.message.red").addClass('hidden')
          $("#amount").prop('disabled', false);
          $("#memo").prop('disabled', false);
          $("#addbalance").removeClass('disabled')
          Session.set('to',$("#to").val())
        }
      });
    });
  }
  else { $("#amount").prop('disabled', false); $("#addbalance").removeClass('disabled'); }

  // Getting the balances
  $("#addbalance").click(function ()
  {
    var balance = $("#addbalance").text().split(' ')
    $("#amount").val(balance[2])
    $(".amount.message.red").addClass('hidden')
    Session.set('amount',balance[2]) 
    $("#confirmtransfer").removeClass('disabled')
  });

  // Control of the amont field
  $("#amount").change(function ()
  {
    var balance = $("#addbalance").text().split(' ')
    if(parseFloat($("#amount").val()) <= balance[2])
    {
      $(".amount.message.red").addClass('hidden')
      Session.set('amount',$("#amount").val());
      if((Session.get('to') || 'powerdown'==operation) && Session.get('amount'))
        { $("#confirmtransfer").removeClass('disabled') }
    }
    else
    {
      $(".amount.message.red").removeClass('hidden')
      $("#confirmtransfer").addClass('disabled')
    }
  });

  // Control of the memo field (if necessary)
  if(['fromsavings-hive', 'fromsavings-hbd', 'hbd-transfer', 'hbd-savingtransfer', 'hive-transfer', 'hive-savingtransfer'].includes(operation))
    $("#memo").change(function () { Session.set('memo',$("#memo").val()) })

  // Submit button
  document.getElementById("confirmtransfer").addEventListener("click", confirmTransfer);

  // Sending the required operation to hivesigner
  function confirmTransfer()
  {
    var coin=''; var url='';
    if( (Session.get('to') && Session.get('amount')) || (Session.get('amount') && 'powerdown'==operation))
    {
      $('.ui.transfer.modal').modal('hide')
      coin = 'HIVE'
      if(['fromsavings-hbd', 'hbd-transfer', 'hbd-savingtransfer'].includes(operation)) { coin = 'HBD' }
      switch(operation)
      {
        case 'hive-transfer':
        case 'hbd-transfer':
          url = "https://hivesigner.com/sign/transfer?to=" + Session.get('to') + 
            "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin +
            "&memo=" + Session.get('memo')
          break;
        case 'hive-savingtransfer':
        case 'hbd-savingtransfer':
          if(Session.get('memo')=='') Session.set('memo', '.')
          url = "https://hivesigner.com/sign/transfer-to-savings?to=" + Session.get('to') +
             "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin +
             "&memo=" + Session.get('memo')
          break;
        case 'powerup':
          url = "https://hivesigner.com/sign/transfer-to-vesting?to=" + Session.get('to') +
              "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin
          break;
        case 'powerdown':
          url = "https://hivesigner.com/sign/withdraw-vesting?vesting_shares=" +
              parseFloat(Session.get('amount')).toFixed(3) + "%20HP"
          break;
        case 'delegate':
          url = "https://hivesigner.com/sign/delegateVestingShares?delegator=&delegatee=" + Session.get('to') +
              "&vesting_shares=" + parseFloat(Session.get('amount')).toFixed(3) + "%20HP"
          break;
        case 'fromsavings-hive':
        case 'fromsavings-hbd':
          reqid = (Math.random()*1000000000).toString().replace('.','');
          if(Session.get('memo')=='') Session.set('memo', '.')
          url = 'https://hivesigner.com/sign/transfer_from_savings?request_id=' + reqid +
              "&to=" + Session.get('to') + '&amount=' +
              parseFloat(Session.get('amount')).toFixed(3) + ' ' + coin + "&memo=" + Session.get('memo')
          break;
      }
      var win = window.open(url, '_blank');
      win.focus();
    }
  }
}

// No events
Template.transfermodal.events({ })

