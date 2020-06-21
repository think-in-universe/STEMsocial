Followers = new Mongo.Collection(null)

// Method to get all the people followed by an account
Followers.loadFollowing = function (username, startFollowing = undefined)
{
  hive.api.getFollowing(username, startFollowing, 'blog', 1000, (err, res)=>
  {
    // Error message
    if (!res) {console.log('Hive API error (getFollowers): ', err); return; }

    // Everything is fine
    for (let i=0; i<res.length; i++) { Followers.upsert(res[i], res[i]); }

    // Recursive call
    if (res.length==1000) Followers.loadFollowing(username, res[res.length - 1].follower);
  });
}

// Method to get all the followers of an account
Followers.loadFollowers = function (username, startFollowers = undefined)
{
  hive.api.getFollowers(username, startFollowers, 'blog', 1000, (err, res)=>
  {
    // Error message
    if (!res) {console.log('Hive API error (getFollowers): ', err); return; }

    // Everything is fine
    for (let i=0; i<res.length; i++) { Followers.upsert(res[i], res[i]); }

    // Recursive call
    if (res.length==1000) Followers.loadFollowers(username, res[res.length - 1].follower);
  });
}
