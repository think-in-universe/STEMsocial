// Rendering
Template.votemodal.rendered = function () { }

// Initializastion of the vote modal
Template.votemodal.init = function ()
{
  // Setting up the sliders
  let vp = 50;
  if(Session.get('currentVotingPercentage')) { vp = Session.get('currentVotingPercentage'); }
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

  function confirmVote()
  {
    $("#confirmbutton").addClass('loading');
    let weight = Session.get('currentVotingPercentage') * 100;
    let author = $("#confirmbutton").attr("data-author");
    let permlink = $("#confirmbutton").attr("data-permlink");
    if (localStorage.kc)
    {
      window.steem_keychain.requestVote(localStorage.username, permlink, author, weight, function(resp)
      {
        $("#confirmbutton").removeClass('loading');
        if(resp.success)
        {
          $('.ui.vote.modal').modal('hide');
          Content.reloadContent(author,permlink,function(error){ if(error) console.log(error) });
        }
      } );
    }
    else
    {
      steemconnect.vote(author, permlink, weight, function (error, result)
      {
        if (result)
        {
          $("#confirmbutton").removeClass('loading');
          $('.ui.vote.modal').modal('hide');
          Content.reloadContent(author,permlink,function(error){ if(error) console.log(error) });
        }
        else
        {
          event.preventDefault()
          sessionStorage.setItem('currentroute', FlowRouter.current().path)
          window.location.href = sc2.getLoginURL()
        }
      });
    }
  }
}

Template.votemodal.events({ });

Template.votemodal.vote = function (article) { }
