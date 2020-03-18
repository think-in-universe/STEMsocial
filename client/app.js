import './buffer';
import './app.html';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import steem from 'steem';
import sc2sdk from 'sc2-sdk';

// Pause the routing
FlowRouter.wait();

// Setup
BlazeLayout.setRoot('body');

// Connection to steemconnect
var dev = false
if (dev)
{
  console.log('DEV VERSION')
  var sc2 = sc2sdk.Initialize({
    baseURL: 'https://steemconnect.com',
    app: 'factit.app',
    callbackURL: 'http://localhost:3000/login',
    accessToken: 'access_token'
  });
}
else
{
  var sc2 = sc2sdk.Initialize({
    baseURL: 'https://steemconnect.com',
    app: 'steemstem-app',
    callbackURL: 'https://www.steemstem.io/#!/login',
    accessToken: 'access_token'
  });
}
window.sc2 = sc2
window.steem = steem;

Session.set('settings', false)

// steemstem setup
steem.api.getAccounts(['steemstem.setup'], function (error, result)
{
  if (!result) { return; }
  for (var i = 0; i < result.length; i++)
  {
    try { result[i].json_metadata = JSON.parse(result[i].json_metadata) } catch (error) { console.log(error) }
    Session.set('settings', result[i].json_metadata.steemstem_settings)
    Session.set('customtags', result[i].json_metadata.steemstem_settings.tags)
  }
});

// Getting the list of promotable posts
steem.api.getAccountHistory('steemstem-io', -1, 500, function(error, result)
{
  // Error, list empty
  if (!result) { return; }

  // Fixing the timestamp and the price
  let promoted = [];
  let stamp = new Date(); stamp.setDate(stamp.getDate() - 10); stamp = stamp.toISOString().slice(0, 19);
  let price = 5;
  if(Session.get('settings').feature_price) { price = parseFloat(Session.get('settings').feature_price[0]); }
  // Getting the list of promoted links
  for (let i = result.length-1; i>= 0; i--)
  {
    if(result[i][1].timestamp<stamp) continue;
    if(result[i][1].op[0]!='transfer' || result[i][1].op[1].to != 'steemstem-io') continue;
    let amount = parseFloat(result[i][1].op[1].amount.split()[0]);
    if(amount<price) continue;
    let link = result[i][1].op[1].memo;
    link=link.split('@');
    if(link.length==2) { link = link[1];}
    else               { link = link[0];}
    promoted.push(link.split('/')[1]);
  }
  Session.set('Promoted', promoted);
});

// To be added to the promotion list (if the list is empty)
steem.api.getDiscussionsByBlog({tag:'lemouth-dev', limit:1}, function (error, result)
{
  if (!result) { console.log(" error = ", error); return; }
  if(Content.findOne({permlink:result[0].permlink})) { return;}
  result = AccountHistory.UpgradeInfo(result[0],100);
  Content.upsert({ _id: result._id }, result)
});

// LOAD SETTINGS
function Setup(api_name,sendDate,res)
{
  let responseTimeMs = (new Date()).getTime() - sendDate;
  console.log('Global Properties loaded from ' + api_name + 'in ' + responseTimeMs + "ms");
  localStorage.setItem('steemProps', JSON.stringify(res));
}

// Main startup function
Meteor.startup(function ()
{
  // printout
  console.log(`%c HiveStem OpenSource v0.10.1: https://github.com/BFuks/hivestem`,
    "font-size: 11px; padding: 1px 1px;");
  console.log(`%c More informations on : https://steemstem.io/aboutus`,
    "font-size: 11px; padding: 1px 1px;");
  console.log(`%c Maintained and developed by @lemouth.`,
    "font-size: 11px; padding: 1px 1px;");

  // CoinMarket and order books to get the steem and sbd values
  coinmarket.steemdollars()
  coinmarket.steem()

  //  SBD/Steem
  steem.api.getOrderBook(1, function (err, result) { if (!err) { Session.set("sbdmarketprice", Number(result.asks[0].real_price).toFixed(2)); } });
  steem.api.getCurrentMedianHistoryPrice(function (error, result) { if (!error) { Session.set('sbdprice', result.base.split(' ')[0]); } });


  // Custom tags and settings
  if (Session.get('settings'))
  {
    sessionStorage.setItem('settings', JSON.stringify(Session.get('settings')))
    sessionStorage.setItem('customtags', JSON.stringify(Session.get('customtags')))
  }
  else if(sessionStorage.getItem('settings'))
  {
    Session.set('settings', JSON.parse(sessionStorage.getItem('settings')))
    Session.set('customtags', JSON.parse(sessionStorage.getItem('customtags')))
  }

  // Setting up the week numbering
  let now=new Date();
  let nDay = (now.getDay() + 6) % 7; now.setDate(now.getDate() - nDay + 3);
  let n1stThursday = now.valueOf(); now.setMonth(0, 1);
  if (now.getDay() !== 4) { now.setMonth(0, 1 + ((4 - now.getDay()) + 7) % 7); }
  let week = 1 + Math.ceil((n1stThursday - now) / 604800000);

  Session.set('this_week', (now.getFullYear()-2000)*100+week)
  Session.set('current_week', (now.getFullYear()-2000)*100+week)
  Session.set('loaded_week', (now.getFullYear()-2000)*100+week-3)
  Session.set('last_loaded_post','')
  Session.set('last_loaded_vote',-1)
  Session.set('last_loaded_vote_stamp',2100)
  Session.set('whitelisted', [])
  Session.set('promolisted', [])
  Session.set('N_whitelist', 0)
  Session.set('N_promolist', 0)
  Session.set('currentVotingPercentage', 50)
  Session.set('visiblecontent', 12)
  if (localStorage.guestuser) { Session.set('guestuser', localStorage.guestuser) }

  //Load global properties
  let sendDate = (new Date()).getTime();
  steem.api.setOptions({url:  'https://api.steemit.com' });
  steem.api.getDynamicGlobalProperties(function (err, result)
  {
    if (result) { Setup('api.steemit.com',sendDate,result); }
    else
    {
      steem.api.setOptions({ url: 'https://steemd.minnowsupportproject.org' });
      steem.api.getDynamicGlobalProperties(function (err, result)
      {
        if (result) { Setup('steemd.minnowsupportproject.org',sendDate,result); }
        else
        {
          steem.api.setOptions({ url: 'https://steemd.privex.io' });
          steem.api.getDynamicGlobalProperties(function (err, result)
          {
            if(result) { Setup('steemd.privex.io',sendDate,result); }
            else
            {
              steem.api.setOptions({ url: 'https://anyx.io' });
              steem.api.getDynamicGlobalProperties(function (err, result)
              {
                if (result) { Setup('anyx.io',sendDate,result); }
              });
            }
          });
        }
      });
    }
  });

//  while(!Session.get('settings')) { continue;}

  // Get votes
  AccountHistory.getVotes();

  // Language
  window.loadLanguage(function (result) { if (result) { console.log(result) } });

  //  flowrouter
  FlowRouter.initialize( { hashbang: true},function () { });

});

