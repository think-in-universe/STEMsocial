Content = new Mongo.Collection(null)


Content.getContentByAuthor = function (author, lastPermlink, cb) {
    var now = new Date();
    hive.api.getDiscussionsByAuthorBeforeDate(author, lastPermlink, dateFormat(now, "yyyy-mm-dd'T'HH:MM:ss"), 5, function (err, result) {
        console.log(err, result);
    });
}

Content.getContent = function (author, permlink,type, cb) {
    hive.api.getContent(author, permlink, function (error, result) {
        if (!result)
            return cb(true)
        else {
            if (result.json_metadata) {
                try {
                    result.json_metadata = JSON.parse(result.json_metadata)
                } catch (error) {
                    console.log(error)
                    cb(error)
                }
                result.type = type
                result._id = result.id
                result.surl = Content.CreateUrl(result.author, result.permlink)
                Content.upsert({ _id: result._id }, result)
            }
        }
    });
}

Content.CreateUrl = function (author, permlink) {
    var url = ""
    url = "#!/@" + author + "/" + permlink
    return url
}
