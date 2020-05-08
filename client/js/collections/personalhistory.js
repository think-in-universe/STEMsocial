PersonalHistory = new Mongo.Collection(null);
var moment = require('moment');

// Get the user account history
PersonalHistory.getPersonalHistory = function (username, limit)
{
  // Getting the last transactions of the account
  hive.api.getAccountHistory(username, -1, limit, (err, res) =>
  {
    // Error
    if (!res) {console.log('Hive API error (account history): ', err); return; }

    // Everything is fine
    for (let i=0; i<res.length; i++) { PersonalHistory.filterhistory(res[i], username); }
  });
}


PersonalHistory.filterhistory = function (transaction, username)
{
  let result = {};
  result.user = username;
  switch (transaction[1].op[0])
  {
    case 'vote':
      result.type = 'vote'
      result.date = transaction[1].timestamp
      result.name = transaction[1].op[1].voter
      result.author = transaction[1].op[1].author
      result.permlink = transaction[1].op[1].permlink
      result.weight = transaction[1].op[1].weight / 100
      break;
    case 'comment':
      if (transaction[1].op[1].author === username) result.type = 'comment';
      else result.type = 'replies';
      result.date = transaction[1].timestamp
      result.name = transaction[1].op[1].author
      result.parent_permlink = transaction[1].op[1].parent_permlink
      result.permlink = transaction[1].op[1].permlink
      break;
    case 'transfer':
      result.type = 'transfer'
      result.date = transaction[1].timestamp
      result.from = transaction[1].op[1].from
      result.to = transaction[1].op[1].to
      result.amount = transaction[1].op[1].amount
      result.memo = transaction[1].op[1].memo
      break;
    case 'claim_reward_balance':
      result.date = transaction[1].timestamp
      result.name = transaction[1].op[1].account
      result.reward_hbd = transaction[1].op[1].reward_sbd
      result.reward_hive  = transaction[1].op[1].reward_steem
      result.reward_vests = transaction[1].op[1].reward_vests
      break;
    default:
      break;
  }
  PersonalHistory.upsert({ _id: result.id}, result);
}
