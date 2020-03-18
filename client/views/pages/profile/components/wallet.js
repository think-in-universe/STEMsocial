// Rendering of the page (nothing special)
Template.wallet.rendered = function () { }


Template.wallet.helpers(
{
  // Function evaluating whether the user has rewards to claim
  pendingReward: function (user) 
  {
    if (!user || !user.reward_sbd_balance || !user.reward_steem_balance || !user.reward_vesting_balance)
      return false
    if (user.reward_sbd_balance.split(' ')[0] > 0 || user.reward_steem_balance.split(' ')[0] > 0 ||
      user.reward_vesting_balance.split(' ')[0] > 0)  {return true}
  },

  // Function to get and display the rewards to be claimed
  displayReward: function (user)
  {
    let rewards = [];
    if (user.reward_sbd_balance.split(' ')[0]     > 0) rewards.push(user.reward_sbd_balance);
    if (user.reward_steem_balance.split(' ')[0]   > 0) rewards.push(user.reward_steem_balance);
    if (user.reward_vesting_balance.split(' ')[0] > 0) rewards.push(user.reward_vesting_steem.split(' ')[0] + ' SP');
    return rewards.join(', ');
  }
})

// Wallet actions
Template.wallet.events(
{
  // Claim reward button
  'click #claim': function (event)
  {
    let user  = MainUser.findOne()
    let steem = user.reward_steem_balance;
    let sbd   = user.reward_sbd_balance;
    let vests = user.reward_vesting_balance;
    event.preventDefault()
    if (localStorage.kc)
    {
      let json = ['claim_reward_balance',{ account:localStorage.username,reward_steem:steem,reward_sbd:sbd,reward_vests:vests}];
      window.steem_keychain.requestBroadcast(localStorage.username, [json], 'Posting', function(response)
      {
        if(!response.success) { console.log('Error with keychain (cannot claim rewards)', response); return; }
        MainUser.add(localStorage.username, function (error) { if (error) { console.log(error) } });
        FlowRouter.reload();
      });
    }
    else
    {
      steemconnect.claimRewardBalance(steem, sbd, vests, function (error)
      {
        if (error) { console.log('Error when claiming rewards with steemconnect', error); return; }
        MainUser.add(localStorage.username, function (error) { if (error) { console.log(error) } });
        FlowRouter.reload();
      });
    }
  },

  // Wrapper calling the transfer form when called from STEEM
  'click .transfer': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class").value)
  },

  // Wrapper calling the transfer form when called from SP
  'click .transferSP': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-SP").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-SP").value)
  },

  // Wrapper calling the transfer form when called from SBD
  'click .transferSBD': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-SBD").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-SBD").value)
  },

  // Wrapper calling the transfer form when called from the STEEM savings menu
  'click .transfersavings': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-savings").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-savings").value)
  },

  // Wrapper calling the transfer form when called from the SBD savings menu
  'click .transfersbdsavings': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-sbdsavings").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-sbdsavings").value)
  }
})
