// Rendering
Template.votemodal.rendered = function () { }

// Initializastion of the vote modal
Template.votemodal.init = function (iscomment=false)
{
  // Do we have a comment
  Session.set('vote-modal',iscomment);

  // Setting up the sliders
  let vp = 50;
  if(Session.get('currentVotingPercentage')) vp = Session.get('currentVotingPercentage');
  $('input[type="rangeslide"]').ionRangeSlider(
  {
    type    : "single",
    min     : 0,
    max     : 100,
    from    : vp,
    grid    : true,
    keyboard: true,
    onChange: function (data) { Session.set('currentVotingPercentage', data.from) }
  });

  // Confirm button
  document.getElementById("confirmbutton").addEventListener("click", confirmVote);

  function UpdatePostInfo(author, permlink)
  {
    hive.api.getContent(author, permlink, (err2, res2)=>
    {
      // If error
      if (!res2) 
      {
        $("#confirmbutton").removeClass('loading');
        $('.ui.vote.modal').modal('hide');
        return;
      }

      // Updating the post information
      if(!iscomment)
      {
        let res = AccountHistory.UpgradeInfo(res2, Content.findOne({author:author, permlink:permlink}).upvoted);
        delete res._id;
        Content.update({author:author, permlink:permlink}, {$set: res});
      }
      else
      {
        Comments.update({author:author, permlink:permlink}, {$set: res2});
        Comments.GetVotes(Comments.findOne({author:author, permlink:permlink}));
      }

      // Exit
      $("#confirmbutton").removeClass('loading');
      $('.ui.vote.modal').modal('hide');
    });
  }

  function confirmVote()
  {
    $("#confirmbutton").addClass('loading');
    let weight = Session.get('currentVotingPercentage') * 100;
    let author = $("#confirmbutton").attr("data-author");
    let permlink = $("#confirmbutton").attr("data-permlink");

    HiveConnect(['vote', localStorage.username, permlink, author, weight], function(response)
    {
      // Updating the buttons
      $("#confirmbutton").removeClass('loading');

      // Checking the output of the communication with Hive
      if(!response.success) return;

      // Everything was fine -> updating the post information
      UpdatePostInfo(author,permlink);
    });
  }
}

Template.votemodal.vote = function (article) { }

Template.votemodal.helpers({ IsComment: function() { return Session.get('vote-modal'); } });

