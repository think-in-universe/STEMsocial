// Function testing the token validity
tokentest = function()
{
  var time = new Date();
  if (!localStorage.username || !localStorage.expires_at || (time.getTime() > Date.parse(localStorage.expires_at)) )
  {
    event.preventDefault()
    $('.ui.steemconnect.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.steemconnectmodal, {data:this}));
    $('.ui.steemconnect.modal').modal('setting', 'transition', 'scale').modal('show')
    Template.steemconnectmodal.init()
    return false
  }
  else { return true }
}

// Steemconnect machinery
steemconnect = {
  // Voting function
  vote: function (author, permlink, weight, cb)
  {
    localStorage.setItem('sc2_command', 'vote_'+author+'_'+permlink+'_'+weight)
    if(tokentest())
    {
      var voter = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.vote(voter, author, permlink, weight, function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Claiming rewards
  claimRewardBalance: function (reward_steem_balance, reward_sbd_balance, reward_vesting_balance, cb)
  {
    localStorage.setItem('sc2_command','claim_'+reward_steem_balance +'_'+ reward_sbd_balance +'_'+ reward_vesting_balance)
    if(tokentest())
    {
      var voter = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.claimRewardBalance(voter, reward_steem_balance, reward_sbd_balance, reward_vesting_balance,
         function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Comment
  comment: function (parentAuthor, parentPermlink, body, jsonMetadata, cb)
  {
    sessionStorage.setItem('currentroute', '@'+parentAuthor+'/'+parentPermlink)
    localStorage.setItem('sc2_command','comment_'+parentAuthor+'_'+parentPermlink+'_'+body+'_'+JSON.stringify(jsonMetadata))
    if(tokentest())
    {
      var voter = localStorage.username
      var permlink = Math.random(voter + parentPermlink).toString(36).substr(2, 9)
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.comment(parentAuthor, parentPermlink, voter, permlink, permlink, body, jsonMetadata,
         function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Comment
  updatecomment: function (parentAuthor, parentPermlink, permlink, title, body, jsonMetadata, cb)
  {
    sessionStorage.setItem('currentroute', '@'+parentAuthor+'/'+parentPermlink)
    localStorage.setItem('sc2_command','commentupdate_'+parentAuthor+'_'+parentPermlink+'_'+permlink+'_'+title+'_'+body+'_'+JSON.stringify(jsonMetadata))
    if(tokentest())
    {
      var voter = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.comment(parentAuthor, parentPermlink, voter, permlink, title, body, jsonMetadata,
         function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Sending a transaction (i.e. a post here) to the blockchain
  send: function (operations, cb)
  {
    data = '1_'+JSON.stringify(operations[0][1]).split('_').join('UNDERSKORE')
    if(operations.length==2)
    {
        data = '2_'+JSON.stringify(operations[0][1]).split('_').join('UNDERSKORE') +
           '_' + JSON.stringify(operations[1][1]).split('_').join('UNDERSKORE')
    }
    sessionStorage.setItem('currentroute', '@'+operations[0][1].author + '/' + operations[0][1].permlink)
    localStorage.setItem('sc2_command','broadcast_'+data)
    if(tokentest())
    {
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.broadcast(operations, function (err, result) { cb(err, result); console.log(result) })
      delete localStorage.sc2_command
    }
  },

  // Addition of a follower
  follow: function (following, cb)
  {
    localStorage.setItem('sc2_command','follow_'+following)
    if(tokentest())
    {
      var follower = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.follow(follower, following, function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Unfollowing
  unfollow: function (unfollowing, cb)
  {
    localStorage.setItem('sc2_command','unfollow_'+unfollowing)
    if(tokentest())
    {
      var unfollower = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.unfollow(unfollower, unfollowing, function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Resteeming
  reblog: function (author, permlink, cb)
  {
    localStorage.setItem('sc2_command','reblog_'+author+'_'+permlink)
    sessionStorage.setItem('currentroute', '@'+author+'/'+permlink)
    if(tokentest())
    {
      var voter = localStorage.username
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.reblog(voter, author, permlink, function (err, result) { cb(err, result) })
      delete localStorage.sc2_command
    }
  },

  // Getting user information
  me: function ()
  {
    sc2.setAccessToken(localStorage.accesstoken);
    sc2.me(function (error, result) {
      if(!error) { Session.set('userdata',result.user_metadata) }
      else       { console.log(error) }
    })
  },

  // Updating user information
  updateUserMetadata:function(metadata,cb)
  {
    localStorage.setItem('sc2_command','metadata_'+JSON.stringify(metadata).split('_').join('UNDERSKORE'))
    if(tokentest())
    {
      sc2.setAccessToken(localStorage.accesstoken);
      sc2.updateUserMetadata(metadata, function (err, result) {
        console.log(err, result)
        if(result) { steemconnect.me(); cb(null) }
        else       { cb(true) }
      });
      delete localStorage.sc2_command
    }
  }
}
