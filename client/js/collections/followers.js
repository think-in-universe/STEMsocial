Followers = new Mongo.Collection(null)

Followers.loadFollowing = function (username, startFollowing = undefined, recursive = true, cb) {
    var limit = 100
    hive.api.getFollowing(username, startFollowing, 'blog', limit, function (error, results) {
        if (error) console.log(error)
        if (results && results.length) {
            for (var i = 0; i < results.length; i++)
                Followers.upsert(results[i], results[i])
            if (results.length == limit && recursive)
                Followers.loadFollowing(username, results[results.length - 1].following, true, cb)
        }
    });
}

// Method to get the followers of an account
Followers.loadFollowers = function (username, startFollowers = undefined)
{
  hive.api.getFollowers(username, startFollowers, 'blog', 1000, (err, res)=>
  {
    // Error message
    if (!res) {console.log('Hive API error (getFollowers): ', err); return; }
    console.log('follow', res);

    // Everything is fine
    for (let i=0; i<res.length; i++) { Followers.upsert(res[i], res[i]); }

    // Recursive call
    if (res.length==1000) Followers.loadFollowers(username, res[res.length - 1].follower);
  });
}
