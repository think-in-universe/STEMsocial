import './buffer';
import './app.html';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import hive from '@hiveio/hive-js';
let hivesigner = require('hivesigner');

// Pause the routing
FlowRouter.wait();

// API settings
let my_urls = [ 'https://anyx.io', 'https://api.hive.blog' , 'https://api.openhive.network', 'https://api.hivekings.com'];
function API_connect(url_id)
{
  // Safety
  if(url_id>=my_urls.length) return API_connect(0);

  // Setting the API path
  hive.api.setOptions({useAppbaseApi:true, url:my_urls[url_id]});

  // Testing the API
  let sendDate = (new Date()).getTime();
  hive.api.getDynamicGlobalProperties( (err, res) =>
  {
    // API not working
    if (!res)
    {
      console.log('Hive API error (getDynamicGlobalProperties on' + my_urls[url_id] + '): ', err);
      return API_connect(url_id+1);
    }
    // Else everything is good
    let responseTimeMs = (new Date()).getTime() - sendDate;
    console.log(' Global Properties loaded from ' + my_urls[url_id]+ ' in ' + responseTimeMs + "ms");
    localStorage.setItem('HiveProps', JSON.stringify(res));

    // STEMsocial setup
    hive.api.getAccounts(['steemstem.setup'], function (error, result)
    {
      if (!result) { return; }
      for (let j = 0; j<result.length; j++)
      {
        try { result[j].json_metadata = JSON.parse(result[j].json_metadata) } catch (error) { console.log(error); }
        Session.set('settings', result[j].json_metadata.steemstem_settings);
        Session.set('customtags', result[j].json_metadata.steemstem_settings.tags);
        sessionStorage.setItem('settings', JSON.stringify(Session.get('settings')));
        sessionStorage.setItem('customtags', JSON.stringify(Session.get('customtags')));
      }

      // tags
      let allowed_tags = [];
      for(let i=0; i<Session.get('customtags').length; i++)
      {
        allowed_tags.push(Session.get('customtags')[i].category);
        if(Session.get('customtags')[i].subcategories)
          allowed_tags = allowed_tags.concat(Session.get('customtags')[i].subcategories);
      }
      Session.set('allowed_tags',allowed_tags);
      sessionStorage.setItem('allowed_tags',JSON.stringify(allowed_tags));
    });

    // Getting the list of promotable posts
    hive.api.getAccountHistory('steemstem-io', -1, 500, function(error, result)
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

    // lemouth-dev promotion
    hive.api.getDiscussionsByBlog({tag:'lemouth-dev', limit:1}, (error, result)=>
    {
      if (!result || result.length==0) { console.log(" error = ", error); return; }
      if(Content.findOne({permlink:result[0].permlink})) { return;}
      result = AccountHistory.UpgradeInfo(result[0],100);
      Content.upsert({ _id: result._id }, result)

      // Latest STEMsocial posts
      hive.api.getDiscussionsByBlog({tag:'steemstem', limit:30}, (error2, result2)=>
      {
        if (!result2 || result2.length==0) { console.log(" error = ", error2); return; }
        for (let ii=0;ii<result2.length; ii++)
        {
          if(!Content.findOne({permlink:result2[ii].permlink}))
          {
            let myres = AccountHistory.UpgradeInfo(result2[ii],100);
            Content.upsert({ _id: myres._id }, myres);
          }
        }

        // Get all other votes
        AccountHistory.getVotes();

        //  flowrouter
        FlowRouter.initialize( { hashbang: true},function () { });
      });
    });

    // Exit
    return;
  });
}

// Setup
BlazeLayout.setRoot('body');

// Connection to hivesigner
let sc2 = new hivesigner.Client({
  app: 'hivestem-app',
  callbackURL: 'https://stem.openhive.network/#!/login',
  accessToken: 'access_token',
//  app: 'hivestem-app.dev',
//  callbackURL: 'http://localhost:3000/#!/login',
  scope: ['vote', 'comment', 'delete_comment']
});

window.sc2 = sc2
window.hive= hive;

// Main startup function
Meteor.startup(function ()
{
  // printout
  console.log(`%c STEMsocial OpenSource v0.11.26: https://github.com/BFuks/stemsocial`,
    "font-size: 11px; padding: 1px 1px;");
  console.log(`%c More informations on : https://stem.openhive.network/aboutus`,
    "font-size: 11px; padding: 1px 1px;");
  console.log(`%c Maintained and developed by @lemouth.`,
    "font-size: 11px; padding: 1px 1px;");

  // STEMsocial Settings
  Session.set('settings', false)
  if(sessionStorage.getItem('settings'))
    Session.set('settings',    JSON.parse(sessionStorage.getItem('settings')));
  if(sessionStorage.getItem('customtags'))
    Session.set('customtags',  JSON.parse(sessionStorage.getItem('customtags')));
  if(sessionStorage.getItem('allowed_tags'))
    Session.set('allowed_tags',JSON.parse(sessionStorage.getItem('allowed_tags')));
  Session.set('main_tags', JSON.stringify(['hive-196387', 'steemstem']));

  // Setting up the week numbering
  let timestamp = Blaze._globalHelpers['Timestamp']('');
  Session.set('this_week', timestamp);

  Session.set('whitelisted', [])
  Session.set('promolisted', [])
  Session.set('N_whitelist', 0)
  Session.set('N_promolist', 0)
  Session.set('currentVotingPercentage', 50)

  // Get posts
  Session.set('current_week',           timestamp);
  Session.set('loaded_week',            timestamp-2);
  Session.set('last_loaded_vote_stamp', 2100);
  Session.set('last_loaded_vote',       -1);
  Session.set('last_loaded_post',       JSON.stringify({}));
  Session.set('load_post_charge',        30);

  // View configuration
  Session.set('visiblecontentlimit',    5);
  Session.set('visiblecontent',         5);
  Session.set('blogs_per_page', 50);

  // Language
  window.loadLanguage(function (result) { if (result) { console.log(result) } });

  // API connect
  API_connect(0);
});

