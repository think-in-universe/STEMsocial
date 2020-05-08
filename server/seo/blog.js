SSR.compileTemplate('seoblog', Assets.getText('blog.html'));

Template.seoblog.helpers(
{
  desc: function(body)
  {
    text = Blaze._globalHelpers['ToHTML'](body);
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
    return text.slice(0,150)+'...';
  },

  img: function(body)
  {
    var __imgRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/gi;
    return 'https://steemitimages.com/0x0/' + body.match(__imgRegex)[0];
  }
})
