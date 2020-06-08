// Main function
HiveConnect = function(args, cb)
{
  if(localStorage.kc) UseKeychain(args, function(response) { cb(CheckKeychain(response)); });
  else                UseHiveSigner(args, function(response) { cb(CheckHiveSigner(response)); });
}


// Communicating with Hive
UseKeychain = function(args, cb)
{
  // Getting the method
  switch(args.shift())
  {
    case 'comment':
      window.hive_keychain['requestPost'](args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],
        function(response) { cb(response); });
      break;
    case 'vote':
      window.hive_keychain['requestVote'](args[0],args[1],args[2],args[3], function(response) { cb(response); });
      break;
    case 'delete': case 'claim':
      window.hive_keychain['requestBroadcast'](args[0],args[1],args[2], function(response) { cb(response); });
      break;
    case 'reblog':
      window.hive_keychain['requestCustomJson'](args[0],args[1],args[2],args[3],args[4],
        function(response) { cb(response); });
      break;
  }
}


UseHiveSigner = function(args, cb)
{
  // Saving the information jsut in case
  let reload=false; if(localStorage.connect_command) reload=true;
  localStorage.setItem('connect_command', JSON.stringify(args));
  localStorage.setItem('connect_route', FlowRouter.current().path);

  // First testing the token validity
  let time = new Date();
  if(!localStorage.username || !localStorage.expires_at || (time.getTime() > Date.parse(localStorage.expires_at)) )
  {
    $('.ui.hivesigner.modal').remove();
    $('article').append(Blaze.toHTML(Template.hivesignermodal));
    $('.ui.hivesigner.modal').modal('setting', 'transition', 'scale').modal('show');
    Template.hivesignermodal.init();
    return;
  }

  // The token is fine
  localStorage.removeItem('connect_route');
  localStorage.removeItem('connect_command');
  sc2.setAccessToken(localStorage.accesstoken);
  switch(args.shift())
  {
    case 'comment':
      sc2.comment(args[4],args[3],args[0],args[6],args[1],args[2],JSON.parse(args[5]), function(err, res)
        {
          if(reload)
          {
            let start=new Date().getTime(); for (let i=0;i<1e7;i++) { if ((new Date().getTime()-start) > 1000) break; }
            Comments.loadComments(args[4],args[3]);
          }
          cb(err,res);
        });
      break;
    case 'vote':
      sc2.vote(args[0],args[2],args[1],args[3], function (err,res)
        {
          if(reload)
          {
            let start=new Date().getTime(); for (let i=0;i<1e7;i++) { if ((new Date().getTime()-start) > 1000) break; }
             hive.api.getContent(args[2], args[1], (err2, res2) =>
             {
               if(!res2) cb(err2,res2);
               if(Content.findOne({author:args[2], permlink:args[1]}))
               {
                 let res3=AccountHistory.UpgradeInfo(res2, Content.findOne({author:args[2], permlink:args[1]}).upvoted);
                 delete res3._id;
                 Content.update({author:args[2], permlink:args[1]}, {$set: res3});
               }
               else if (Comments.findOne({author:args[2], permlink:args[1]}))
               {
                 Comments.update({author:args[2], permlink:args[1]}, {$set: res2});
                 Comments.GetVotes(Comments.findOne({author:args[2], permlink:args[1]}));
               }
            });
          }
          cb(err,res);
        });
      break;
    case 'delete':
      sc2.deleteComment(args[1][0][1]['author'],args[1][0][1]['permlink'], function (err,res)
        {
          if(reload)
          {
            let start=new Date().getTime(); for (let i=0;i<1e7;i++) { if ((new Date().getTime()-start) > 1000) break; }

            if(args[3] && args[4]) Comments.remove({author:args[1][0][1]['author'], permlink:args[1][0][1]['permlink']});
            else Content.remove({author:args[1][0][1]['author'], permlink:args[1][0][1]['permlink']});
            if (Comments.findOne({author:args[3], permlink:args[4]}))
            {
              let mother = Comments.findOne({author:args[3], permlink:args[4]});
              Comments.update({author:args[3], permlink:args[4]}, {$set: {children:mother.children-1}});
            }
          }
          cb(err,res);
        });
      break;
    case 'reblog':
      let author   = JSON.parse(args[3])[1]['author'];
      let permlink = JSON.parse(args[3])[1]['permlink'];
      sc2.reblog(args[0], author, permlink, function (err, res) { cb(err,res) });
      break;
    case 'claim':
      let hive = args[1][0][1]['reward_steem'];
      let hbd  = args[1][0][1]['reward_sbd'];
      let vest = args[1][0][1]['reward_vests'];
      sc2.claimRewardBalance(args[0], hive, hbd, vest, function (err,res)
        {
          if(reload)
          {
            MainUser.remove(args[0], function() { MainUser.add(args[0], function () { }); });
            FlowRouter.reload();
          }
          cb(err, res) })
      break;
  }
}


// Checking for error messages
CheckKeychain = function(response)
{
  // Modal setup (if needed)
  Session.set('connect_mediator', 'Hive Keychain');
  Session.set('connect_message', response.message);
  Session.set('connect_error',   response.error);

  // If there is a problem -> we need to display a modal
  if(!response.success)
  {
    $('.ui.hiveconnect.mini.modal').remove()
    $('article').append(Blaze.toHTML(Template.hiveconnectmodal));
    $('.ui.hiveconnect.mini.modal').modal('setting', 'transition', 'scale').modal('show');
    Template.hiveconnectmodal.init(response);
  }

  // return the response
  return response;
}


CheckHiveSigner = function(error, result)
{
  // Everything is fine
  console.log('err = ', error); console.log('res=', result);
  if(!error) { return { success:true }; }
  if(error=='incomplete') error={success:false, error_description:'Incomplete keychain request', error:'incomplete'};
  else  error['success'] = false;

   // Modal setup (if needed) -> upgrading the error message as the response
  Session.set('connect_mediator', 'HiveSigner');
  Session.set('connect_message', error.error_description);
  Session.set('connect_error', error.error);

  // If there is a problem -> we need to display a modal
  if(!error.success)
  {
    $('.ui.hiveconnect.mini.modal').remove()
    $('article').append(Blaze.toHTML(Template.hiveconnectmodal));
    $('.ui.hiveconnect.mini.modal').modal('setting', 'transition', 'scale').modal('show');
    Template.hiveconnectmodal.init(error);
  }

  // return the response
  return error;
}
