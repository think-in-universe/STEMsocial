MainUser = new Mongo.Collection(null)
User = new Mongo.Collection(null)

MainUser.add = function (username, cb)
{
  hive.api.getAccounts([username], function (error, result)
  {
    // Error
    if (!result || result.length < 1) { cb(true); return; }

    // Everything is alright
    for (let i=0; i<result.length; i++)
    {
      if(typeof result[i].json_metadata==='string' || result[i].json_metadata instanceof String)
        result[i].json_metadata = JSON.parse(result[i].json_metadata);

      // Another user has already been saved
      if (MainUser.findOne()) { MainUser.remove({}); }

      // Saving
      MainUser.insert(result[i])

      // Getting followers
      Followers.loadFollowing(username);
    }
    cb(null);
  });
}

User.add = function (username, cb) {
    hive.api.getAccounts([username], function (error, result) {
        if (!result || result.length < 1) {
            cb(true)
            return
        }
        for (i = 0; i < result.length; i++) {
            try {
                result[0].json_metadata = JSON.parse(result[0].json_metadata)
            } catch (error) {
                //console.log(error)
            }
            hive.api.getFollowCount(username, function (err, res) {
                if(!error)
                {
                    result[0].follower_count = res.follower_count
                    result[0].following_count = res.following_count
                    if (User.findOne()) {
                        User.remove({})
                    }
                    User.insert(result[0])
                }
            })
        }
        cb(null)
    });
}
