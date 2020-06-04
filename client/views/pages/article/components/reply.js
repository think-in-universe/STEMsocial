// Rendering
Template.reply.rendered = function () { $('.ui.form.replyform').hide(); }


// Helpers
Template.reply.helpers(
{
  // Return true for the root comment
  isroot: function () { return (this.data.parent_author=='') },

  // Allow to get the content of the reply
  DisplayReplyBody: function()
  {
    if(Session.get('preview-reply-'+this.data.permlink))
      { return Blaze._globalHelpers['ToHTML'](Session.get('preview-reply-'+this.data.permlink)); }
  },

  // Is the comment deletable
  Deletable: function() {
   return ( (this.data.active_votes.length==0) && (this.data.children==0) && (this.data.last_payout<this.data.created) ); }
});


// Events (on click)
Template.reply.events({
  // Action when clicking on the reply button
  'click .reply-action': function(event){
    // Hide the form and get information
    document.getElementById('reply-button-'+this.data.permlink).style.display = "none";
    var element = ".reply-" + this.data.permlink;

    // A few lines to get the content of the text area
    if(!Session.get('preview-reply-'+this.data.permlink))
      { Session.set('preview-reply-'+this.data.permlink,'Add reply here...') }
    var link = this.data.permlink
    $('#reply-content-'+link).on('input', function() {
      Session.set('preview-reply-'+link, this.value);
      if(this.value=='') { Session.set('preview-reply-'+link,'Add reply here...') }
    });

    // Show the reply form
    $(element).show();
  },

  // Action when clicking on the edit button (replacement of the comment by a form to be edited)
  'click .edit-action': function(event){
    var link = this.data.author+'-'+this.data.permlink

    document.getElementById('comment-'+link).style.display = "none";
    document.getElementById('comment-edit-'+link).style.display = "";
    document.getElementById('edit-button-'+this.data.permlink).style.display = "none";
    document.getElementById('submit-edited-comment-'+this.data.permlink).style.display = "";
    Session.set('preview-comment-edit-'+link,document.getElementById('comment-edit-content-'+link).value);

    // For the preview of the new reply
    $('#comment-edit-content-'+link).on('input', function() {
        Session.set('preview-comment-edit-'+link, this.value);
        if(this.value=='') { Session.set('preview-comment-edit'+link,'Add reply here...') }
    })

  },

  // Action when closing the reply window (and saving its content)
  'click .window.close':function(event){
    var element = ".reply-" + this.data.permlink;
    Session.set('preview-reply-'+this.data.permlink,$('#reply-content-'+ this.data.permlink).val())
    $(element).hide();
    document.getElementById('reply-button-'+this.data.permlink).style.display = "";
  },

  // Action when clicking on the submit-comment button
  'click .submit-comment-action': function (event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('submit-comment-'+this.data.permlink).classList.add('loading');
    Template.reply.comment(this.data);
  },

  // Action when clicking on the comment-editing validation button
  'click .submit-edit-action': function (event) {
    event.preventDefault();
    document.getElementById('submit-edited-comment-'+this.data.permlink).classList.add('loading');
    Template.reply.updatecomment(this.data)
  },

  // Action when clicking on the 'delete comment' button
  'click .ui.button.del': function(event)
  {
    $('.ui.delete.mini.modal').remove();
    $('article').append(Blaze.toHTMLWithData(Template.deletemodal, { project: this.data }));
    $('.ui.delete.mini.modal').modal('setting', 'transition', 'scale').modal('show');
    Template.deletemodal.init();
  }

})

// Function dedicated to the reply submission
Template.reply.comment = function (article)
{
  let body = $('#reply-content-'+ article.permlink).val();
  let json_metadata = { tags: 'hive-196387', app: 'stemsocial' };
  let permlink = 'stemsocial-app-comment-'+ (Math.round((new Date()).getTime() / 1000)).toString();

  // Posting the comment
  HiveConnect(['comment',localStorage.username,'',body,article.permlink,article.author,json_metadata,permlink,''],
    function(response)
    {
      // Updating the buttons
      document.getElementById('submit-comment-'+article.permlink).classList.remove('loading');

      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything is alright -> updating the comment information
      document.getElementById('reply-button-'+article.permlink).style.display = "";
      Comments.loadComments(article.author, article.permlink);
      if( Comments.findOne({author:article.author, permlink:article.permlink}))
        Comments.update({author:article.author, permlink:article.permlink}, {$set: {children:article.children+1}});
      else if( Content.findOne({author:article.author, permlink:article.permlink}) )
        Content.update({author:article.author, permlink:article.permlink}, {$set: {children:article.children+1}});
    });
}


// Updating an existing comment and send to Hive; then updating the post display
Template.reply.updatecomment = function (article)
{
  let newbody = Session.get('preview-comment-edit-'+article.author+'-'+article.permlink);
  let link = article.author+'-'+article.permlink
  let json = article.json_metadata;
  json['app'] = "stemsocial";

  // Updating the comment
  HiveConnect(['comment', localStorage.username, article.title, newbody, article.parent_permlink,
    article.parent_author, json, article.permlink, ''], function(response)
    {
      // Updating the buttons
      document.getElementById('submit-edited-comment-'+article.permlink).classList.remove('loading')

      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything is fine
      document.getElementById('comment-'+link).innerHTML=Blaze._globalHelpers['ToHTML'](newbody);
      Comments.loadComments(article.author, article.permlink);
      document.getElementById('comment-edit-'+link).style.display = "none";
      document.getElementById('submit-edited-comment-'+article.permlink).style.display = "none";
      document.getElementById('comment-'+link).style.display = "";
      document.getElementById('edit-button-'+article.permlink).style.display = "";
    });
}

