Template.comment.rendered = function ()
{
  $('.left.commentvotes-'+this.data.permlink).popup(
    { popup: '.commentvotes.popup.'+this.data.permlink, position: 'left center' }
  );
}


// Events
Template.comment.events(
{
  // Initiate the comment vote
  'click #upvote': function (event) {
    event.preventDefault();
    event.stopPropagation();
    $('.ui.vote.modal').remove();
    $('article').append(Blaze.toHTMLWithData(Template.votemodal, { project: this }));
    $('.ui.vote.modal.' + this.permlink).modal('setting', 'transition', 'scale').modal('show');
    Template.votemodal.init(true);
  },

  // Initiate the comment downvote
  'click #downvote': function (event) {
    event.preventDefault()
    event.stopPropagation();
    $('.ui.downvote.modal').remove();
    $('article').append(Blaze.toHTMLWithData(Template.downvotemodal, { project: this }));
    $('.ui.downvote.modal.' + this.permlink).modal('setting', 'transition', 'scale').modal('show');
    Template.downvotemodal.init(true);
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
  // And for its preview in comment editing mode
  DisplayCommentEditBody: function ()
  {
    if(Session.get('preview-comment-edit-'+this.author+'-'+this.permlink))
      { return Blaze._globalHelpers['ToHTML'](Session.get('preview-comment-edit-'+this.author+'-'+this.permlink)); }
  },

  // Getting the list of voters to display in the popup
  GetCommentVotes: function()
  {
    let voters =  this.active_votes.filter(obj => { return parseInt(obj.rshares)!=0; });
    voters.sort(function(b,a) { return (parseInt(a.rshares)-parseInt(b.rshares)); });
    return voters;
  },

  // Number of likes and disklikes
  NLikes:    function() { return this.active_votes.filter(obj => { return parseInt(obj.rshares) > 0; }).length; },
  NDislikes: function() { return this.active_votes.filter(obj => { return parseInt(obj.rshares) < 0; }).length; },

  // Has liked or disliked
  HasUpvoted: function()
  {return this.active_votes.filter(obj=>{return obj.voter==localStorage.username && parseInt(obj.rshares)>=0;}).length>0;},
  HasDownvoted: function()
  {return this.active_votes.filter(obj=>{return obj.voter==localStorage.username && parseInt(obj.rshares)<0;}).length>0;},

  // Total value of the comment
  GetCommentValue: function(vote_shares, comment)
  {
    if(comment.active_votes.length==0) return 0;
    // Getting the user part of the total rshares
    let frac=0;
    for(let i=0; i<comment.active_votes.length; i++) frac+=parseInt(comment.active_votes[i].rshares);
    frac = parseInt(vote_shares)/frac;

    // Getting the total payout and multiplying by the share
    let check1 = (comment.pending_payout_value=='0.000 HBD');
    let check2 = (comment.total_payout_value=='0.000 HBD');
    let check3 = (comment.curator_payout_value=='0.000 HBD');
    if( check1 && !check2 && !check3 )
       frac*=(parseFloat(comment.total_payout_value.split(' ')[0])+parseFloat(comment.curator_payout_value.split(' ')[0]));
    else if( !check1 && check2 && check3 )
       frac*=parseFloat(comment.pending_payout_value.split(' ')[0]);
    else frac = 0;
    return frac.toFixed(3);
  }
});

