Template.comment.rendered = function () {
  if(this.data.net_votes > 0)
    $('.left.commentvotes-'+this.data.permlink)
    .popup({ popup: '.commentvotes.popup', position: 'left center' });
}


// Events
Template.comment.events({
  // Initiate the comment vote
  'click  #vote': function (event) {
    event.preventDefault()
    event.stopPropagation();
    $('.ui.vote.modal').remove()
    $('article').append(Blaze.toHTMLWithData(Template.votemodal, { project: this }));
    $('.ui.vote.modal.' + this.permlink).modal('setting', 'transition', 'scale').modal('show')
    Template.votemodal.init()
  },

  // Action when closing the reply window (hiding/showing the different objects and saving the content)
  'click .commentedit.window.close':function(event){
    var link = this.author+'-'+this.permlink;
    Session.set('preview-comment-edit-'+link,this.value);
    document.getElementById('comment-edit-'+link).style.display = "none";
    document.getElementById('submit-edited-comment-'+this.permlink).style.display = "none";
    document.getElementById('comment-'+link).style.display = "";
    document.getElementById('edit-button-'+this.permlink).style.display = "";
  }
})

Template.comment.helpers(
{
  // Markdown management for the comment itself...
  DisplayCommentBody: function () { return Blaze._globalHelpers['ToHTML'](this.body); },

  // And for its preview in comment editing mode
  DisplayCommentEditBody: function ()
  {
    if(Session.get('preview-comment-edit-'+this.author+'-'+this.permlink))
      { return Blaze._globalHelpers['ToHTML'](Session.get('preview-comment-edit-'+this.author+'-'+this.permlink)); }
  },

  // Getting the list of voters to display in the popup
  GetCommentVotes: function() { 
    if(this.net_votes > 0)
    {
      voters = this.active_votes;
      voters.sort(function(b,a) { return (parseInt(a.rshares)-parseInt(b.rshares)) });
      return voters
    }
  },
  TotalRShares: function(comment) {
    if(comment.net_votes > 0)
    {
      total=0;
      for(i=0; i < comment.active_votes.length; i++)
        { total += parseInt(comment.active_votes[i].rshares) }
      return total
    }
  },


  // Display the payout brought in by a single voter (for the popup)
  DisplayCommentPayout: function (shares, shares_sum,sum) { return (shares*sum/shares_sum).toFixed(3) }
})

