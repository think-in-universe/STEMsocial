// Rendering of the page (nothing special)
Template.wallet.rendered = function ()
{
  // Do we have to claim rewards?
  if(localStorage.connect_command) HiveConnect(JSON.parse(localStorage.connect_command), function() { });
}


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
    if (user.reward_vesting_balance.split(' ')[0] > 0) rewards.push(user.reward_vesting_steem.split(' ')[0] + ' HP');
    return rewards.join(', ');
  }
})

// Wallet actions
Template.wallet.events(
{
  // Claim reward button
  'click #claim': function (event)
  {
    let user  = MainUser.findOne({name:localStorage.username});
    let json = ['claim_reward_balance',{ account:localStorage.username,reward_steem:user.reward_steem_balance,
       reward_sbd:user.reward_sbd_balance, reward_vests:user.reward_vesting_balance}];

    document.getElementById('claim').classList.add('loading');
    HiveConnect(['claim', localStorage.username, [json], 'Posting'], function(response)
    {
      // Updating the button
      document.getElementById('claim').classList.remove('loading');

      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything is fine -> resettng the balance
      MainUser.remove(localStorage.username, function() { MainUser.add(localStorage.username, function ()
        {   FlowRouter.reload();}); });
    });
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

  // Wrapper calling the transfer form when called from HP
  'click .transferHP': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-HP").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-HP").value)
  },

  // Wrapper calling the transfer form when called from HBD
  'click .transferHBD': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-HBD").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-HBD").value)
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

  // Wrapper calling the transfer form when called from the HBD savings menu
  'click .transferhbdsavings': function (event)
  {
    event.preventDefault()
    event.stopPropagation();
    this.current_op = document.getElementById("operation-class-hbdsavings").value
    $('.ui.transfer.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.transfermodal, {data:this}));
    $('.ui.transfer.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.transfermodal.init(document.getElementById("operation-class-hbdsavings").value)
  }
})
