Comments = new Mongo.Collection(null)

//  Loading comments without the active votes
Comments.loadComments = function (author, permlink, root=true)
{
  // If blacklist -> nothing to do
  if(root && Session.get('settings').blacklist.includes(author)) return;

  // Not blacklisted -> interrogating the blockchain to get the comments
  steem.api.getContentReplies(author, permlink, (err, res) =>
  {
    // Error, no result
    if (!res) { console.log('steem API error (getContentReplies): ', err); return; }

    // Everything is fine, storing the information
    for (let i=0; i < res.length; i++)
    {
        // metadata
        let comment = res[i]
        if(res[i].json_metadata) comment.json_metadata = JSON.parse(res[i].json_metadata);

        // Storing the comments and getting the vote information
        Comments.upsert({ _id: comment.id }, comment);
        Comments.GetVotes(comment);

        // Moving on with the subcomments
        Comments.loadComments(comment.author, comment.permlink, false);
    }
  });
}

// Getting the active votes on a comment
Comments.GetVotes = function (comment)
{
  steem.api.getActiveVotes(comment.author, comment.permlink, (err, res) =>
  {
    // Error, no result
    if (!res) { console.log('steem API error (getActiveVotes): ', err); return; }

    // Storing the votes
    Comments.update({author:comment.author, permlink:comment.permlink}, {$set: {'active_votes':res}});
  });
}
