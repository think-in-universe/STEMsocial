import showdown from 'showdown'
const steemMarkdown = require('steem-markdown-only')

SSR.compileTemplate('seoblog', Assets.getText('blog.html'));

Template.seoblog.helpers(
{
  desc: function(body)
  {
    var text = body.replace(/<span([^>]*)>/g,'ssioMUF[$1]');
    text = text.replace(/<\/span>/g,'ENDssioMUF');
    text = steemMarkdown(text)
    text = text.replace(/ssioMUF\[([^\]]*)\]/g,'<span $1>');
    text = text.replace(/ENDssioMUF/g,'</span>');
    var converter = new showdown.Converter(),
    text = converter.makeHtml(text);
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    text = text.replace(urlPattern, "")
    text = text.replace(/<img[^>"']*((("[^"]*")|('[^']*'))[^"'>]*)*>/g, "");
    text = text.replace(/<(?:.|\n)*?>/gm, '');
    text = text.replace(/<br>/gi, "");
    text = text.replace(/<br\s\/>/gi, "");
    text = text.replace(/<br\/>/gi, "");
    text = text.replace(/<p.*>/gi, "");
    text = text.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");
    text = text.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
    text = text.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
    text = text.replace(/<(?:.|\s)*?>/g, "");
    text = text.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "");
    text = text.replace(/ +(?= )/g, '');
    text = text.replace(/&nbsp;/gi, " ");
    text = text.replace(/&amp;/gi, "&");
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/&lt;/gi, '<');
    text = text.replace(/&gt;/gi, '>');
    text = text.replace(/\.[^/.]+$/, "")
    text = text.split('\n').join(" ")
    return text.slice(0,150)+'...';
  },

  img: function(body)
  {
    var __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
    return 'https://steemitimages.com/0x0/' + body.match(__imgRegex)[0];
  }
})
