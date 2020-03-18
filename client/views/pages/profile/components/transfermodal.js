// No rendering
Template.transfermodal.rendered = function () { }

// Helpers
Template.transfermodal.helpers(
{
  // Is the memo field needed
  NeedsMemo: function()
  {
    if(['steem-transfer', 'steem-savingtransfer', 'sbd-transfer', 'sbd-savingtransfer','fromsavings-steem', 'fromsavings-sbd'].includes(this.data.current_op)) {return true}
    return false
  },

  // Is the 'to' field needed?
  NeedsTo: function()
  {
    if(['powerdown'].includes(this.data.current_op)) {return false}
    return true
  },

  // Do we need to calculate the balance from the available SP
  NeedsSPBalance: function()
  {
    if(['powerdown', 'delegate'].includes(this.data.current_op)) {return  true}
    return false
  },

  // Do we need to calculate the balance from the available liquid STEEM tokens
  NeedsSteemBalance: function()
  {
    if(['steem-transfer', 'steem-savingtransfer', 'powerup'].includes(this.data.current_op)) {return true}
    return false
  },

  // Do we need to calculate the balance from the available SBD tokens
  NeedsSBDBalance: function()
  {
    if(['sbd-transfer', 'sbd-savingtransfer'].includes(this.data.current_op)) {return true}
    return false
  },

   // Do we need to calculate the balance from the SBD tokens avaialble in savings
  NeedsSBDSavingsBalance: function()
  {
    if(['fromsavings-sbd'].includes(this.data.current_op)) {return true}
    return false
  },

   // Do we need to calculate the balance from the available SBD tokens
  NeedsSteemSavingsBalance: function()
  {
    if(['fromsavings-steem'].includes(this.data.current_op)) {return true}
    return false
  },

  // Title of the operation
  OperationTitle: function()
  {
    var title=''
    switch(this.data.current_op)
    {
      case 'steem-transfer':       title="STEEM Wallet Transfer"; break;
      case 'steem-savingtransfer': title="STEEM Transfer to Savings."; break;
      case 'fromsavings-steem':    title="Withdraw STEEM from Savings."; break;
      case 'sbd-transfer':         title="SBD Wallet Transfer"; break;
      case 'sbd-savingtransfer':   title="SBD Transfer to Savings."; break;
      case 'fromsavings-sbd':      title="Withdraw SBD from Savings."; break;
      case 'powerup':              title="Convert to STEEM POWER."; break;
      case 'powerdown':            title="Withdraw STEEM POWER."; break;
      case 'delegate':             title="Delegate STEEM POWER."; break;
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
      case 'fromsavings-sbd':
      case 'fromsavings-steem': AmountClass="Amount to withdraw"; break;
    }
    return AmountClass
  },

  // Description of the operation
  OperationDescr: function()
  {
    var descr=''
    switch(this.data.current_op)
    {
      case 'steem-transfer':
        descr="Move STEEM funds to another Steem account."
        break;
      case 'steem-savingtransfer':
        descr="Move STEEM funds to a saving account (protect funds by requiring a three-day withdraw waiting period)."
        break;
      case 'powerup':
        descr="STEEM POWER is non-transferable and requires 13 weeks to be converted back to Steem."
        break;
      case 'powerdown':
        descr="Set up a STEEM POWER withdrawal (1/13 of the powered down amount to be withdrawn once every week during 13 weeks)."
        break;
      case 'delegate':
        descr="Delegate STEEM POWER to another Steem account. Delegated STEEM POWER can be recovered 5 days after undelegating."
        break;
      case 'sbd-transfer':
        descr="Move SBD funds to another Steem account."
        break;
      case 'sbd-savingtransfer':
        descr="Move SBD funds to a saving account (protect funds by requiring a three-day withdraw waiting period)."
        break;
      case 'fromsavings-steem':
        descr="Withdraw STEEM funds from a saving account (a three-day withdraw waiting period is required)."
        break;
      case 'fromsavings-sbd':
        descr="Withdraw SBD funds from a saving account (a three-day withdraw waiting period is required)."
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
  if(['fromsavings-sbd', 'fromsavings-steem', 'sbd-transfer', 'sbd-savingtransfer', 'steem-transfer', 'steem-savingtransfer', 'delegate', 'powerup'].includes(operation))
  {
    $("#to").change(function ()
    {
      steem.api.lookupAccountNames([$("#to").val()], function (error, result)
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
      Session.set('amount',$("#amount").val()) 
      if(Session.get('to') && Session.get('amount')) { $("#confirmtransfer").removeClass('disabled') }
    }
    else
    {
      $(".amount.message.red").removeClass('hidden')
      $("#confirmtransfer").addClass('disabled')
    }
  });

  // Control of the memo field (if necessary)
  if(['fromsavings-steem', 'fromsavings-sbd', 'sbd-transfer', 'sbd-savingtransfer', 'steem-transfer', 'steem-savingtransfer'].includes(operation))
    $("#memo").change(function () { Session.set('memo',$("#memo").val()) })

  // Submit button
  document.getElementById("confirmtransfer").addEventListener("click", confirmTransfer);

  // Sending the required operation to steemconnect
  function confirmTransfer()
  {
    var coin=''; var url='';
    if( (Session.get('to') && Session.get('amount')) || (Session.get('amount') && 'powerdown'==operation))
    {
      $('.ui.transfer.modal').modal('hide')
      coin = 'STEEM'
      if(['fromsavings-sbd', 'sbd-transfer', 'sbd-savingtransfer'].includes(operation)) { coin = 'SBD' }
      switch(operation)
      {
        case 'steem-transfer':
        case 'sbd-transfer':
          url = "https://steemconnect.com/sign/transfer?to=" + Session.get('to') + 
            "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin +
            "&memo=" + Session.get('memo')
          break;
        case 'steem-savingtransfer':
        case 'sbd-savingtransfer':
          if(Session.get('memo')=='') Session.set('memo', '.')
          url = "https://steemconnect.com/sign/transfer-to-savings?to=" + Session.get('to') +
             "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin +
             "&memo=" + Session.get('memo')
          break;
        case 'powerup':
          url = "https://steemconnect.com/sign/transfer-to-vesting?to=" + Session.get('to') +
              "&amount=" + parseFloat(Session.get('amount')).toFixed(3) + " " + coin
          break;
        case 'powerdown':
          url = "https://steemconnect.com/sign/withdraw-vesting?vesting_shares=" +
              parseFloat(Session.get('amount')).toFixed(3) + "%20SP"
          break;
        case 'delegate':
          url = "https://steemconnect.com/sign/delegateVestingShares?delegator=&delegatee=" + Session.get('to') +
              "&vesting_shares=" + parseFloat(Session.get('amount')).toFixed(3) + "%20SP"
          break;
        case 'fromsavings-steem':
        case 'fromsavings-sbd':
          reqid = 'SSIO-'+(Math.random()*1000000000).toString();
          if(Session.get('memo')=='') Session.set('memo', '.')
          url = 'https://steemconnect.com/sign/transfer-from-savings?request_id=' + reqid +
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

