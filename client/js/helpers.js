import { Session } from "meteor/session";
import moment from 'moment-with-locales-es6'

// Getting the first image of the post (for the thumbnail)
Template.registerHelper('imgFromBody', function (project)
{
  // no image to get
  if (!project) return;

  // getting an image if there is one
  let __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
  if (__imgRegex.test(project.body)) return 'https://images.hive.blog/0x0/' + project.body.match(__imgRegex)[0];

  // no image
  return;
});


Template.registerHelper('isBlacklisted', function (name) {
    if(!Session.get('settings').blacklist.includes(result[i].author))
    return false
    else
    return true
});


Template.registerHelper('translator', function (code) {
    return translate(code);
});



Template.registerHelper('isFollowing', function (following) {
    if(!MainUser.findOne()) return false;
    var followers = Followers.findOne({ follower: MainUser.find().fetch()[0].name, following: following })
    if (followers) return true
    return false;
})

// Formatter for the posts description
Template.registerHelper('shortDescription', function (string) { return string.slice(0, 225) + " ..." });

Template.registerHelper('xssShortFormatter', function (text)
{
  if (!text) return text;
  text = Blaze._globalHelpers['ToHTML'](text);
  let urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
  text = text.replace(urlPattern, "")
  text = text.replace(/<img[^>"']*((("[^"]*")|('[^']*'))[^"'>]*)*>/g, "");
  text = text.replace(/<(?:.|\n)*?>/gm, '');
  //-- remove BR tags and replace them with line break
  text = text.replace(/<br>/gi, "\n");
  text = text.replace(/<br\s\/>/gi, "\n");
  text = text.replace(/<br\/>/gi, "\n");

  //-- remove P and A tags but preserve what's inside of them
  text = text.replace(/<p.*>/gi, "\n");
  text = text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");

  //-- remove all inside SCRIPT and STYLE tags
  text = text.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  text = text.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  //-- remove all else
  text = text.replace(/<(?:.|\s)*?>/g, "");

  //-- get rid of more than 2 multiple line breaks:
  text = text.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\n\n");

  //-- get rid of more than 2 spaces:
  text = text.replace(/ +(?= )/g, '');

  //-- get rid of html-encoded characters:
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/\.[^/.]+$/, "")
  return text;
});

// Color by categories
Template.registerHelper('colorByCategory', function (tag)
{
  let colors = Session.get('customtags')
  if (colors.find(item => item.category === tag) && !['steemstem', 'hive-196387'].includes(tag))
  {
    let item = colors.find(item => item.category === tag);
    return item.color;
  }
});

Template.registerHelper('inequals', function (a, b) {
    return a !== b;
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('settingsLoaded', function () {
    return Session.get('settings')
});

Template.registerHelper('displayDate', function (date) {
    return moment(date).format('MMMM Do YYYY');
})

Template.registerHelper('displayDateFull', function (date) {
    return moment(date).format('MMMM Do YYYY, h:mm:ss a');
})

Template.registerHelper('DisplayTimeFrom', function (date) {
    if (!date) return
    return moment(date + 'Z').fromNow()
})

Template.registerHelper('DisplayTimeCreated', function (date) {
    if (!date) return
    return moment(date).format("lll")
})

Template.registerHelper('displayUpvote', function (share, rewards) {
    return (share * rewards).toFixed(3);
})


Template.registerHelper('displayReputation', function (string)
  { return hive.formatter.reputation(string); })

Template.registerHelper('EstimateAccount', function (user) {

    if (Coins.findOne({ 'id': 'hive' }) && Coins.findOne({ 'id': 'hive-dollars' })) {
        var balanceHive  = parseFloat(user.balance.split(' ')[0])
        var balanceVests = parseFloat(user.vesting_shares.split(' ')[0])
        var balanceSbd = parseFloat(user.sbd_balance.split(' ')[0])
        var balanceUsd = 0

        balanceUsd += Coins.findOne({ 'id': 'hive' }).price_usd * vestToHivePower(balanceVests)
        balanceUsd += Coins.findOne({ 'id': 'hive' }).price_usd * balanceHive
        balanceUsd += Coins.findOne({ 'id': 'hive-dollars' }).price_usd * balanceSbd
        return parseFloat(balanceUsd).toFixed(2)
    }
    else {
        return 0

    }
})

// Check whether all STEMsocial posts of the week are visible
Template.registerHelper('isLoadedFull', function (coll) {
    if(!coll) { return true }
    if(Session.get('visiblecontent') >= coll.length) { return true }
    else { return false }
})


Template.registerHelper('isSubscribed', function (following) {
    var sub = Subs.findOne({ follower: MainUser.find().fetch()[0].name, following: following })
    if (sub) return true
    return false;
})



Template.registerHelper('DisplayVotingPower', function (votingPower, lastVoteTime, precision) {
    if (isNaN(votingPower)) return
    var secondsPassedSinceLastVote = (new Date - new Date(lastVoteTime + "Z")) / 1000;
    votingPower += (10000 * secondsPassedSinceLastVote / 432000);
    return Math.min(votingPower / 100, 100).toFixed(precision)
})


Template.registerHelper('DisplayHivePower', function (vesting_shares)
{
  var HP = 0;
  if (vesting_shares) HP = Number(vestToHivePower(vesting_shares.split(' ')[0]))
  return parseFloat(HP).toFixed(3) + ' HIVE'
})

Template.registerHelper('DisplayDelegatedHivePower', function (delegated)
{
  var HP = 0;
  if (delegated) HP = HP - Number(vestToHivePower(delegated.split(' ')[0]))
  return parseFloat(HP).toFixed(3) + ' HIVE'
})

Template.registerHelper('DisplayReceivedHivePower', function (received_vesting_shares)
{
  var HP = 0;
  if (received_vesting_shares) HP = HP + Number(vestToHivePower(received_vesting_shares.split(' ')[0]))
  return parseFloat(HP).toFixed(3) + ' HIVE'
})

Template.registerHelper('DisplayEffectiveHivePower', function (vesting_shares, delegated, received_vesting_shares)
{
  var HP = 0;
  if (vesting_shares)          HP = HP + Number(vestToHivePower(vesting_shares.split(' ')[0]))
  if (delegated)               HP = HP - Number(vestToHivePower(delegated.split(' ')[0]))
  if (received_vesting_shares) HP = HP + Number(vestToHivePower(received_vesting_shares.split(' ')[0]))
  return parseFloat(HP).toFixed(3) + ' HIVE'
})


Template.registerHelper('vestToHivePower', function (userVests) {
    var globals = JSON.parse(localStorage.HiveProps)
    var totalHive = parseFloat(globals.total_vesting_fund_steem.split(' ')[0])
    var totalVests = parseFloat(globals.total_vesting_shares.split(' ')[0])
    userVests = userVests.split(' ')[0]
    var HP = totalHive * (userVests / totalVests)
    return parseFloat(HP).toFixed(3) + ' HP'
})

Template.registerHelper('displayRewards', function (text) {
    if (!text) return text;
    text = text.replace(/(?:\r\n|\r|\n)/g, ' ');
    var array = [];
    var str = text,
        rg = /\[REWARD(.+?)\]/g, match;
    while (match = rg.exec(str)) {
        array.push(match[1].split(':'))
    }
    return array;
})

function vestToHivePower(userVests) {
    if (JSON.parse(localStorage.HiveProps) && userVests) {
        var globals = JSON.parse(localStorage.HiveProps)
        var totalHive = parseFloat(globals.total_vesting_fund_steem.split(' ')[0])
        var totalVests = parseFloat(globals.total_vesting_shares.split(' ')[0])
        var HP = totalHive * (userVests / totalVests)
        return HP
    }
}

Template.registerHelper('isMobile', function () {
    if (/Mobi/.test(navigator.userAgent)) {
        return true;
    }
    return false;
});

Template.registerHelper('guestuser', function () {
    if (!Session.get('guestuser')) return
    else {
        var guestuser = Session.get('guestuser')
        return guestuser
    }
})

Template.registerHelper('mainuser', function () {
    if (!MainUser.find().fetch()) return
    else {
        var user = MainUser.find().fetch()
        return user[0]
    }
})

Template.registerHelper('visibleContents', function () {
    return Session.get('visiblecontent')
})

Template.registerHelper('userdata', function () {
        return Session.get('userdata')
})


// Get the list of drafts
Template.registerHelper('drafts', function ()
{
  if(Session.get('userdata'))
  {
    if (Session.get('userdata').includes('drafts')) {return Session.get('userdata').drafts;}
  }
});

Template.registerHelper('unfiltered', function () {
        return Session.get('unfiltered')
})

Template.registerHelper('currentSearch', function ()
{
  if (Session.get('currentSearch')) return Session.get('currentSearch');
  else return 'STEMsocial';
});

  // Get the week number and year number to which one should show posts
Template.registerHelper('currentWeek', function () { return Session.get('current_week'); })


Template.registerHelper('whitelist', function () {
    if (Session.get('settings'))
        return Session.get('settings').whitelist
})

Template.registerHelper('isWhitelisted', function (user_permlink) {
    if (Session.get('settings'))
        var whitelist = Session.get('settings').whitelist
    if (whitelist.includes(user_permlink))
        return true
})

Template.registerHelper('isBlacklisted', function (user_permlink) {
    if (Session.get('settings'))
        var blacklist = Session.get('settings').blacklist
    if (blacklist.includes(user_permlink))
        return true
})


Template.registerHelper('MainUserRate', function (project)
{
  if (!project || (!project.active_votes && !project.net_votes) ) return
  if (project.active_votes)
  {
    for (let i = 0; i < project.active_votes.length; i++)
    {
      if (project.active_votes[i].voter==localStorage.username && parseInt(project.active_votes[i].percent) > 0)
        return parseFloat(project.active_votes[i].percent / 100).toFixed(0)
    }
  }
  else
  {
    if (project.net_votes)
    {
      for (var i = 0; i < project.net_votes.length; i++)
      {
        if (project.net_votes[i].voter == localStorage.username && parseInt(project.net_votes[i].percent) > 0)
         return parseFloat(project.net_votes[i].percent / 100).toFixed(0)
      }
    }
  }
});

// Computing the post rewards
Template.registerHelper('displayPayout', function (active, total, voter)
{
  if(parseFloat(active.split(' ' )[0])>0) return parseFloat(active.split(' ' )[0]).toFixed(3);
  else return (parseFloat(voter.split(' ' )[0])+parseFloat(total.split(' ' )[0])).toFixed(3);
});

Template.registerHelper('displayPayoutUpvote', function (share, rewards) {
    return (share * rewards).toFixed(3);
})

Template.registerHelper('displayAllVoters', function (votes, isDownvote) {
    if (!votes) return
    votes.sort(function (a, b) {
        var rsa = parseInt(a.rshares)
        var rsb = parseInt(b.rshares)
        return rsb - rsa
    })
    if (isDownvote) votes.reverse()

    var rsharesTotal = 0;
    for (let i = 0; i < votes.length; i++)
        rsharesTotal += parseInt(votes[i].rshares)

    var top300 = []
    for (let i = 0; i < 300; i++) {
        if (i == votes.length) break
        votes[i].rsharespercent = parseInt(votes[i].rshares) / rsharesTotal
        if (parseInt(votes[i].rshares) < 0 && !isDownvote) break;
        if (parseInt(votes[i].rshares) >= 0 && isDownvote) break;
        top300.push(votes[i])
    }
    return top300
})

Template.registerHelper('displayVotersTop', function (votes, isDownvote) {
    if (!votes) return
    votes.sort(function (a, b) {
        var rsa = parseInt(a.rshares)
        var rsb = parseInt(b.rshares)
        return rsb - rsa
    })
    if (isDownvote) votes.reverse()

    var rsharesTotal = 0;
    for (let i = 0; i < votes.length; i++)
        rsharesTotal += parseInt(votes[i].rshares)

    var top20 = []
    for (let i = 0; i < 20; i++) {
        if (i == votes.length) break
        votes[i].rsharespercent = parseInt(votes[i].rshares) / rsharesTotal
        if (parseInt(votes[i].rshares) <= 0 && !isDownvote) break;
        if (parseInt(votes[i].rshares) >= 0 && isDownvote) break;
        top20.push(votes[i])
    }
    return top20
})

Template.registerHelper('isArray', function (array) {
    if (!array) return
    if ($.isArray(array))
        return true
    else return false
});


// Related to tags
Template.registerHelper('customTags', function (array) {
    if (Session.get('customtags'))
        return Session.get('customtags')
});

Template.registerHelper('IsAllowedTag', function(tag)
{
  // Safety: no custom tags
  if (!Session.get('customtags')) return true;

  // get the list of allowed tags
  return Session.get('allowed_tags').includes(tag);
});


// Dates
Template.registerHelper('Timestamp', function(mydate)
{
  // date to translate
  let now=new Date(mydate);
  if(mydate=='') now=new Date();

  // Compute the timestamp
  let nDay = (now.getDay() + 6) % 7; now.setDate(now.getDate() - nDay + 3);
  let n1stThursday = now.valueOf(); now.setMonth(0, 1);
  if (now.getDay() !== 4) { now.setMonth(0, 1 + ((4 - now.getDay()) + 7) % 7); }
  let week = 1 + Math.ceil((n1stThursday - now) / 604800000);
  return week + 100*(now.getFullYear()-2000);
});

// Formatting: from markdown to HTML
Template.registerHelper('ToHTML', function(text)
{
  let new_text = text;

  // Converting markdown code environment
  let codetags = new_text.match(/(```[^`]+```)|(<pre>.*<\/pre>)/gi);
  if(codetags)
  {
    for(let i=0;i<codetags.length;i++)
    {
      if(codetags[i].startsWith('<pre>')) codetags[i] = codetags[i].substring(6,codetags[i].length-7);
      new_text = new_text.replace(codetags[i], ' --ssioa--'+parseInt(i)+'- ');
    }
  }

  // Protection when using HTML code environments
  let codetags2 = new_text.match(/(`[^`]*`)|(<code>.*<\/code>)/gi);
  if(codetags2)
  {
    for(let i=0;i<codetags2.length;i++)
    {
      if(codetags2[i].startsWith('<code>')) codetags2[i] = codetags2[i].substring(7,codetags2[i].length-8);
      new_text = new_text.replace(codetags2[i], ' --ssiob--'+parseInt(i)+'- ');
    }
  }

  // Converting markdown images to HTML
  let imglink_mkd = new_text.match(/\[\!\[.*?\]\(\S+\)\]\([^\s]+[^\s\)]\)/gi);
  if(imglink_mkd)
  {
    for (let i=0; i<imglink_mkd.length; i++)
    {
      let img_src = imglink_mkd[i].match(/\]\(\S+?\)\]/g);
      if(!img_src) continue;
      img_src = img_src[0].substring(2,img_src[0].length-2);
      let img_tmp = imglink_mkd[i].replace(img_src,'');
      let img_alt = img_tmp.match(/!\[.*?\]\(\)/g);
      if(img_alt)
      {
        img_tmp = img_tmp.replace(img_alt[0],'![](');
        img_alt = 'alt=\"' + img_alt[0].substring(2,img_alt[0].length-3) + '\" ';
      }
      else img_alt = '';
      let link = img_tmp.substring(7,img_tmp.length-1);
      new_text = new_text.replace(imglink_mkd[i], '<a href=\"' + link + '\">' + 
        '<img src=\"'+img_src+'\" l' + img_alt + '/></a>');
    }
  }
  let img_mkd = new_text.match(/\!\[.*?\]\(\S+\)/gi);
  if(img_mkd)
  {
    for (let i=0; i<img_mkd.length; i++)
    {
      let src = img_mkd[i].match(/\]\(\S+\)/g);
      if(!src) continue;
      src = src[0].substring(2,src[0].length-1);
      new_text = new_text.replace(img_mkd[i], '<br /><img src=\"'+src+'\" />');
    }
  }

  // Protection of all HTML tags
  let htmltags = new_text.match(/<\/?\b[^<>]*>/gi);
  if(htmltags) { for (let i=0;i<htmltags.length;i++) { new_text = new_text.replace(htmltags[i], ' --ssioc--'+parseInt(i)+'- '); } }

  // Covering markdown link into HTML
  let fixlinks =  new_text.match(/\]\(\s+http/gi);
  if(fixlinks) { for (let i=0;i<fixlinks.length;i++) { new_text = new_text.replace(fixlinks[i], fixlinks[i].replace(' ','')); } }
  let mkdtags = new_text.match(/\[[^\[\]]+\]\([^ ]+[^ \)]\)/gi);
  if(mkdtags)
  {
    for (let i=0;i<mkdtags.length;i++)
      { new_text=new_text.replace(mkdtags[i], ' --ssiod--'+parseInt(i)+'- '); mkdtags[i]=mkdtags[i].replace(/\n/g,''); }
  }

  // adding links to user ids
  let userid = new_text.match(/@\b[\w.-]+\w+/gi);
  if(userid) { for (let i=0;i<userid.length;i++) { new_text = new_text.replace(userid[i], ' --ssioe--'+parseInt(i)+'- '); } }

  // video embedding
  let vid_urls = new_text.match(/(\bhttps?:\/\/\S+?youtu.?be[^\s\|]+)|(\bhttps?:\/\/youtu.?be[^\s\|]+)/gi);
  if(vid_urls) { for (let i=0;i<vid_urls.length;i++) { new_text = new_text.replace(vid_urls[i], ' --ssiof--'+parseInt(i)+'- '); } }

  // image embedding
  let img_urls = new_text.match(/(\bhttps?:\/\/\S+)((.png)|(.gif)|(.jpg)|(.jpeg))/g);
  if(img_urls) { for (let i=0;i<img_urls.length;i++) { new_text = new_text.replace(img_urls[i], ' --ssiog--'+parseInt(i)+'- '); } }

  // link embedding
  let link_urls = new_text.match(/(\bhttps?:\/\/[^\s\|]+)/g);
  if(link_urls) { for (let i=0;i<link_urls.length;i++) { new_text = new_text.replace(link_urls[i], ' --ssioh--'+parseInt(i)+'- '); } }

  // From markdown to HTML: horizontal lines
  let mkd_lin = new_text.match(/(\n---\n)|(\n_{3,}\n)/g);
  if(mkd_lin) { for (let i=0;i<mkd_lin.length; i++) { new_text = new_text.replace(mkd_lin[i], '\n\n<hr />\n'); } }

  // From markdown to html: bold
  let mkd_bld = new_text.match(/(\_\_[^\_]*\_\_)/g);
  if(mkd_bld)
  {
    for (let i=0;i<mkd_bld.length; i++)
      { new_text = new_text.replace(mkd_bld[i], '<b>'+mkd_bld[i].substring(2,mkd_bld[i].length-2)+'</b>'); }
  }

  // From markdown to html: italic
  let mkd_ita = new_text.match(/(\_[^\_\n]*\_)/g);
  if(mkd_ita)
  {
    for (let i=0;i<mkd_ita.length; i++)
      { new_text = new_text.replace(mkd_ita[i], '<i>'+mkd_ita[i].substring(1,mkd_ita[i].length-1)+'</i>'); }
  }

  // From markdown to HTML: headers
  let mkd_hdr = new_text.match(/^\#{1,6}.+(\n|$)/gm);
  if(mkd_hdr)
  {
    for (let i=0;i<mkd_hdr.length;i++)
    {
      let tmp=mkd_hdr[i];
      if(tmp.endsWith('\n')) tmp = tmp.substring(0,tmp.length-1);
      if(mkd_hdr[i].startsWith('\n')) { tmp=tmp.substring(1,tmp.length); }
      if     (tmp.startsWith('######')) { tmp = tmp.replace('######','<h6>')+'</h6>\n'; }
      else if(tmp.startsWith('#####' )) { tmp = tmp.replace('#####', '<h5>')+'</h5>\n'; }
      else if(tmp.startsWith('####'  )) { tmp = tmp.replace('####',  '<h4>')+'</h4>\n'; }
      else if(tmp.startsWith('###'   )) { tmp = tmp.replace('###',   '<h3>')+'</h3>\n'; }
      else if(tmp.startsWith('##'    )) { tmp = tmp.replace('##',    '<h2>')+'</h2>\n'; }
      else if(tmp.startsWith('#'     )) { tmp = tmp.replace('#',     '<h1>')+'</h1>\n'; }
      new_text = new_text.replace(mkd_hdr[i],tmp);
    }
  }

  let in_table = 0, cell_natures = [], nspaces = [], list_natures = [], in_quote=0;
  // Useful functions for list and tables
  function test_table(item,index) { if(item.match(/(\s|\:)\-{3,}(\s|\:)/g)) { return true;} return false; }
  function close_all_lists(nspaces, natures)
  {
    let res = '';
    for(let j=0; j<nspaces.length; j++)
    {
      let sp = new Array(2*(nspaces.length-j)).join(' ');
      res = res + sp + '</' + natures[natures.length-j-1] +'> ';
    }
    return res;
  }
  // lists and tables
  new_text = new_text.split('\n');
  for(let i=0; i < new_text.length; i++)
  {
    let line = new_text[i];

    // trailing whitespaces
    let idx  = line.search(/\S/);
    if(idx) { line = line.substring(idx, line.length); }

    // quotes
    if(line.startsWith('>'))
    {
      if(in_quote==0) { in_quote++; line='<blockquote>'+line.substring(1,line.length); }
      else             line=line.substring(1,line.length);
      if(i==(new_text.length-1) || !new_text[i+1].startsWith('>'))
        { in_quote--; line=line+'</blockquote>';}
    }

    // protection
    if(nspaces!=[] && line.length==0)
      { new_text[i]=close_all_lists(nspaces,list_natures); nspaces = []; list_natures = []; continue;}
    if(in_quote==0 && in_table==0 && line.length==0) { new_text[i]='<br />'; continue; }
    if(in_quote==0 && in_table==0 && line.trim().length==0) { new_text[i]='<br />'; continue; }
    if(in_table>0 && line.length==0)  { new_text[i-1] = new_text[i-1] + '  </tbody>\n</table>\n'; in_table=0; cell_natures = []; continue;}

    // Lists
    let is_ul= line.match(/^(\*|\-|\+)\s/g);
    let is_ol= line.match(/^\d+\.\s/g);

    // Tables
    let splitted = line.split('|'), is_table = true;
    if(splitted.length==1) is_table = false;
    else
    {
      if (splitted[0].trim()=='') { splitted.splice(0,1); }
      if (splitted[splitted.length-1].trim()=='') { splitted.splice(splitted.length-1,1); }
      for(let j=0; j<splitted.length; j++)
      {
        if(!splitted[j].match(/(\s|\:)?\-{1,}(\s|\:)?/g)) { is_table=false; break; }
        splitted[j] = splitted[j].trim();
        if(splitted[j][0]==':' &&  splitted[j][splitted[j].length-1]==':') { cell_natures.push('center'); }
        else if(splitted[j][splitted[j].length-1]==':')                    { cell_natures.push('right');  }
        else                                                               { cell_natures.push('left');    }
      }
    }

    // New table -> the header
    if(is_table && in_table==0)
    {
      // Closing all open lists
      if(nspaces!=[]) { new_text[i-2] = new_text[i-2] + close_all_lists(nspaces, list_natures); nspaces = []; list_natures = []; }
      // Header of the table
      let header = new_text[i-1].split('|');
      if (header.length==1) continue;
      if (header[0].trim()=='') { header.splice(0,1); }
      if (header[header.length-1].trim()=='')    { header.splice(header.length-1,1); }
      if (header.length==splitted.length) { in_table = splitted.length; }
      else { continue; }
      let new_header='<br /><table>\n  <thead><tr>\n';
      for(let j=0;j<in_table;j++) { new_header = new_header + '    <td align=\''+cell_natures[j]+'\'>' + header[j]+'</td>\n'; }
      new_text[i-1]=new_header + '  </tr></thead>\n  <tbody>';
      new_text[i] = '';
      continue;
    }

    // New table line
    if (in_table>0)
    {
      let tline = line.split('|');
      if (tline[0].trim()=='') { tline.splice(0,1); }
      if (tline[tline.length-1].trim()=='')    { tline.splice(tline.length-1,1); }
      if(line=='|' || line.trim()=='|') {new_text[i]='';continue;}
      else if(tline.length!=in_table) {new_text[i-1]=new_text[i-1]+'  </tbody>\n</table>\n'; in_table=0; cell_natures = [];}
      else
      {
        let new_line='  <tr>\n';
        for(let j=0;j<in_table;j++) { new_line = new_line + '    <td align=\''+cell_natures[j]+'\'>' + tline[j] + '</td>\n'; }
        new_text[i] = new_line + '  </tr>';
        continue;
      }
    }
    // Inside a list but no need for new <li> (the line starts with some spacings)
    if(!is_ul && !is_ol && idx>0 && nspaces.length>0)
    {
      let sp = new Array(2*(nspaces.length+1)).join(' ');
      new_text[i-1] = new_text[i-1].replace('</li>','');
      line = sp + line + '</li>';
    }
    else if(is_ul || is_ol)
    {
      // closing optionally any open table
      if(is_table) { new_text[i-1] = new_text[i-1] + '\n</tbody></table>'; in_table = 0; cell_natures = [];}
      // in which list are we?
      let my_ul = -1;
      for(let j=nspaces.length-1; j>=0; j--) { if(idx==nspaces[j]) {my_ul=j; break; } }
      // A new list is needed
      if(my_ul==-1)
      {
        nspaces.push(idx);
        if(is_ul) {list_natures.push('ul');}
        if(is_ol) {list_natures.push('ol');}
        let sp = new Array(2*nspaces.length).join(' ');
        line = sp + '<' + list_natures[list_natures.length-1] + '>' + sp + '  <li style="margin-top:3px; margin-bottom:3px">'+line.substring(2,line.length)+'</li>';
      }
      // No new list are needed
      else
      {
        let sp = new Array(2*my_ul+2).join(' ');
        line = sp + '  <li style="margin-top:7px; margin-bottom:3px">'+line.substring(2,line.length)+'</li>';
        // Do we need to close some lists
        for(let j=my_ul+1; j<nspaces.length; j++)
          { sp = new Array(2*j+2).join(' '); line = sp + '</' + list_natures[list_natures.length-(j-my_ul)] + '> ' + line; }
        nspaces     = nspaces.slice(0,my_ul+1);
        list_natures = list_natures.slice(0,my_ul+1);
      }
    }
    // Header environment
    else if (line.startsWith('<h')) line = close_all_lists(nspaces, list_natures) + line;

    // Closing what needs to be closed
    else if (idx>0){ line = line + close_all_lists(nspaces, list_natures); nspaces = []; list_natures = []; }
    else { line = close_all_lists(nspaces, list_natures) + line; nspaces = []; list_natures = []; }
    new_text[i]=line;
  }

  // Closing all pending lists
  new_text.push(close_all_lists(nspaces,list_natures)); nspaces = []; list_natures = [];
  new_text = new_text.join('\n');

  // Restoring the <pre> tags
  function restore(text, tag, trueword)
  {
    let mod_text = text;
    mod_text = mod_text.replace(' '+tag+' ', trueword);
    mod_text = mod_text.replace(    tag+' ', trueword);
    mod_text = mod_text.replace(' '+tag    , trueword);
    mod_text = mod_text.replace(    tag    , trueword);
    return mod_text;
  }

  // Restoring the html tags
  if(htmltags)
  {
    for (let i=0;i<htmltags.length;i++)
    {
      if(htmltags[i].match(/<audio/g) && !htmltags[i].match(/controls/g))
        htmltags[i] = htmltags[i].replace('>','controls>');
      new_text = restore(new_text,'--ssioc--'+parseInt(i)+'-', htmltags[i]);
    }
  }
  if(mkdtags)
  {
    for (let i=0;i<mkdtags.length;i++)
    {
      let src = mkdtags[i].match(/\]\(\S+\)/g);
      if(!src && src.length!=1) {console.log('error markdown conversion: ', mkdtags[i]); continue;}
      src = src[0].substring(2,src[0].length-1);
      if(src.startsWith('/') && src!='/') { src = '/#!'+ src; }
      let alt = mkdtags[i].match(/\[[\s\S]*?\]\(/g);
      if(!alt && alt.length!=1) {console.log('error markdown conversion: ', mkdtags[i]); continue;}
      alt = alt[0].substring(1,alt[0].length-2);
      new_text = restore(new_text,'--ssiod--'+parseInt(i)+'-', '<a href=\'' + src + '\'>'+alt+'</a>');
    }
  }

  if(userid) { for (let i=0;i<userid.length;i++)
  {
    let link = userid[i];
    if(!userid[i].startsWith('#!')) { link='#!/'+link; }
    new_text = restore(new_text,'--ssioe--'+parseInt(i)+'-', '<a href=\'/' + link+'\'>' + userid[i] + '</a>'); }
  }

  // video embedding
  if(vid_urls)
  {
    for (let i=0;i<vid_urls.length;i++)
    {
      let urls = vid_urls[i].match(/\bhttps?:\/\/\S+youtube\S+/gi);
      if(urls)
      {
        if(urls[0].includes('watch'))
        {
          let myurl = urls[0].split('<')[0].split(')')[0];
          let decoding = myurl.split('?')[1].split('&');
          let code  = '';
          let start = '';
          for (let j=0; j<decoding.length;j++)
          {
            if     (decoding[j].split('=')[0]=='v')             code  = decoding[j].split('=')[1];
            else if(decoding[j].split('=')[0]=='time_continue') start = '?start='+decoding[j].split('=')[1];
          }
          if(!vid_urls.includes('('+myurl+')'))
            new_text = restore(new_text,'--ssiof--'+parseInt(i)+'-',
              '<br /><iframe frameborder=\"0\" src=\"//www.youtube.com/embed/'+code+start+'\" width=\"640\" height=\"360\" class=\"note-video-clip\"></iframe>');
        }
      }
      urls = vid_urls[i].match(/\bhttps?:\/\/youtu\.be\S+/gi);
      if(urls)
      {
        let myurl = (urls[0].split('/'));
        myurl = myurl[myurl.length-1];
        if(!vid_urls.includes('('+urls[0]+')'))
          new_text= restore(new_text,'--ssiof--'+parseInt(i)+'-',
            '<br /><iframe frameborder=\"0\" src=\"//www.youtube.com/embed/'+myurl+'\" width=\"640\" height=\"360\" class=\"note-video-clip\"></iframe>');
      }
      new_text = restore(new_text,'--ssiof--'+parseInt(i)+'-', vid_urls[i]);
    }
  }

  // From markdown to html: ita+bold
  let mkd_itabld = new_text.match(/(\*\*\*[^\*]*\*\*\*)/g);
  if(mkd_itabld)
  {
    for (let i=0;i<mkd_itabld.length; i++)
      { new_text = new_text.replace(mkd_itabld[i], '<b><i>'+mkd_itabld[i].substring(2,mkd_itabld[i].length-2)+'</i></b>'); }
  }

  // From markdown to html: bold
  mkd_bld = new_text.match(/(\*\*[^\*]*\*\*)/g);
  if(mkd_bld)
  {
    for (let i=0;i<mkd_bld.length; i++)
      { new_text = new_text.replace(mkd_bld[i], '<b>'+mkd_bld[i].substring(2,mkd_bld[i].length-2)+'</b>'); }
  }

  // From markdown to html: italic
  mkd_ita = new_text.match(/(\*\S[^\*]*\*)/g);
  if(mkd_ita)
  {
    for (let i=0;i<mkd_ita.length; i++)
      { new_text = new_text.replace(mkd_ita[i], '<i>'+mkd_ita[i].substring(1,mkd_ita[i].length-1)+'</i>'); }
  }

  // From markdown to html: striketrough
  let mkd_del = new_text.match(/\~\~[^\~]*\~\~/g);
  if(mkd_del) { for (let i=0;i<mkd_del.length; i++) { new_text = new_text.replace(mkd_del[i], '<del>'+mkd_del[i].substring(2,mkd_del[i].length-2)+'</del>'); } }

  // Images and links
  if(img_urls)
  {
    for (let i=0;i<img_urls.length;i++)
      new_text = restore(new_text,'--ssiog--'+parseInt(i)+'-','<br /><img src=\"https://images.hive.blog/1280x0/'+img_urls[i]+'\" /><br />');
  }

  if(link_urls) { for (let i=0;i<link_urls.length;i++) { new_text = restore(new_text,'--ssioh--'+parseInt(i)+'-',
    '<a href=\"'+link_urls[i]+'\">'+link_urls[i]+'</a>'); } }

  // Cleaning
  new_text = new_text.replace(/\n/g,'<br />');
  new_text = new_text.replace(/<hr ?\/?>(<br ?\/?>){2,}/gm,'<hr /><br />');
  new_text = new_text.replace(/(<br ?\/?>){3,}<hr ?\/?>/gm,'<br /><br /><hr />');
  new_text = new_text.replace(/(<br ?\/?>){3,}/gm,'<br /><br />');
  new_text = new_text.replace(/<\/table><br ?\/?><br ?\/?>/gm,'</table><br />');
  new_text = new_text.replace(/<\/blockquote><br ?\/?><br ?\/?>/gm,'</blockquote><br />');
  let divs = new_text.match(/<\/div>\s*(<br ?\/?><br ?\/?>|<br ?\/?>)/g);
  if(divs) for (let i=0;i<divs.length; i++) new_text = new_text.replace(divs[i], '<\/div><br />');
  divs = new_text.match(/<div[^\>\<]*>\s*(<br ?\/?><br ?\/?>|<br ?\/?>)/g);
  if(divs) for (let i=0;i<divs.length; i++) new_text = new_text.replace(divs[i], divs[i].match(/<div[^\>\<]*>/g)[0]);
  let to_clean = ['\/ul', 'ul', '\/li', '\/h1', '\/h2', '\/h3', '\/h4', '\/h5','\/h6','tr','\/td','\/tr',
   '\/thead', 'tbody','\/tbody', '\/ol', 'ol', 'center','\/center','h1','h2','h3','h4','h5','h6'];
  for(let i=0; i<to_clean.length;i++)
  {
    let rep = new RegExp('<'+to_clean[i]+' ?\/?>\\s*(<br ?\/?>)+',"gm");
    new_text = new_text.replace(rep,'<'+to_clean[i]+'>');
    if(!['center'].includes(to_clean[i]))
    {
      rep = new RegExp('(<br ?\/?>)+\\s*<'+to_clean[i]+' ?\/?>',"gm");
      new_text = new_text.replace(rep,'<'+to_clean[i]+'>');
    }
  }

  // code environement
  if(codetags)  { for (let i=0;i<codetags.length;i++) { new_text = restore(new_text,'--ssioa--'+parseInt(i)+'-', '<pre>'+codetags[i].replace(/`/g,'').replace(/>/g,'&gt;').replace(/</g,'&lt;')+'</pre>'); } }
  if(codetags2) { for (let i=0;i<codetags2.length;i++) { new_text = restore(new_text,'--ssiob--'+parseInt(i)+'-', '<code>'+codetags2[i].replace(/`/g,'').replace(/>/g,'&gt;').replace(/</g,'&lt;')+'</code>'); } }
  new_text = new_text.replace(/<\/pre><br ?\/?>/gm,'</pre>');

  // Output
  return new_text;
});
