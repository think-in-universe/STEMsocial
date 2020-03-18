Template.upvote.rendered = function () {
    if(this.data.active_votes.length >= 1)
    $('.left.floated.upvote')
    .popup({
      popup: '.upvote.popup',
      position: 'left center'
    })
  ;
}
