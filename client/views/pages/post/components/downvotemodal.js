// Rendering
Template.downvotemodal.rendered = function () { }

// Initializastion of the vote modal
Template.downvotemodal.init = function (iscomment=false)
{
  // Do we have a comment
  Session.set('vote-modal',iscomment);

  // Setting up the sliders
  $('input[type="rangeslide"]').ionRangeSlider(
  {
    type    : "single",
    min     : -100,
    max     : 0,
    from    : 0,
    grid    : true,
    keyboard: true,
    onChange: function (data) { Session.set('currentVotingPercentage', data.from) }
  });

  // Confirm button
  document.getElementById("confirmbutton").addEventListener("click", confirmVote);

  function UpdatePostInfo(author, permlink)
  {
    steem.api.getContent(author, permlink, (err2, res2)=>
    {
      // If error
      if (!res2) 
      {
        $("#confirmbutton").removeClass('loading');
        $('.ui.downvote.modal').modal('hide');
        return;
      }

      // Updating the post information
      if(!iscomment)
      {
        let res = AccountHistory.UpgradeInfo(res2, Content.findOne({author:author, permlink:permlink}).upvoted);
        Content.update({author:author, permlink:permlink}, {$set: res});
      }
      else Comments.GetVotes(Comments.findOne({author:author, permlink:permlink}));

      // Exit
      $("#confirmbutton").removeClass('loading');
      $('.ui.downvote.modal').modal('hide');
    });
  }

  function confirmVote()
  {
    $("#confirmbutton").addClass('loading');
    let weight = Session.get('currentVotingPercentage') * 100;
    let author = $("#confirmbutton").attr("data-author");
    let permlink = $("#confirmbutton").attr("data-permlink");
    if (localStorage.kc)
    {
      window.hive_keychain.requestVote(localStorage.username, permlink, author, weight, function(resp)
      {
        if(resp.success) UpdatePostInfo(author,permlink);
        else $("#confirmbutton").removeClass('loading');
      } );
    }
    else
    {
      hivesigner.vote(author, permlink, weight, function (error, result)
      {
        if (result) UpdatePostInfo(author,permlink);
        else
        {
          $("#confirmbutton").removeClass('loading');
          event.preventDefault()
          sessionStorage.setItem('currentroute', FlowRouter.current().path)
          window.location.href = sc2.getLoginURL()
        }
      });
    }
  }
}

Template.downvotemodal.events({ });

Template.downvotemodal.downvote = function (article) { }

Template.downvotemodal.helpers({ IsComment: function() { return Session.get('vote-modal'); } });
