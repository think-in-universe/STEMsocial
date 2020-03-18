Comments = new Mongo.Collection(null)

//  Loading comments without the active votes
Comments.loadComments = function (author, permlink, cb, root=true) {
  // If blacklist -> nothing to do
  if(root && Session.get('settings').blacklist.includes(author)) return;

  // Not blacklisted -> interrogating the blockchain to get the comments
  steem.api.getContentReplies(author, permlink, function (error, result) {
    if (result)
    {
      for (var i = 0; i < result.length; i++)
      {
        if(result[i].json_metadata) { result[i].json_metadata = JSON.parse(result[i].json_metadata) }
        // Storing the comments
        var comment = result[i]
        Comments.upsert({ _id: comment.id }, comment);
        // Requiring the voters if needed
        if(comment.net_votes!=comment.active_votes.length)
          Comments.GetVotes(comment, function (error) {if (error) { console.log(error) }});
        // Moving on with the subcomments
        Comments.loadComments(comment.author, comment.permlink, function (err) {if(err){console.log(err)}}, false)
      }
    }
    cb(null)
  })
}

// Getting the active votes on a comment
Comments.GetVotes = function (comment, cb) {
  steem.api.getActiveVotes(comment.author, comment.permlink, function(err, res) {
    if(res) {
      Comments.update({ 'permlink': comment.permlink }, {$set: {'active_votes':res}});
      stored_comment = Comments.findOne({ 'permlink': comment.permlink });
    }
  })
}
