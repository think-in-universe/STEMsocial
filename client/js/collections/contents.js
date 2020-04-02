Content = new Mongo.Collection(null)

// Helper allowing to get the list of posts
Content.getCreatedContent = function (tag, limit, type, cb)
{
  var query = { tag: tag, limit: limit };
  steem.api.getDiscussionsByCreated(query,
    function (error, result)
    {
      if (!result) { return cb(error) }
      else
      {
        for (var i = 0; i < result.length; i++)
        {
          try { result[i].json_metadata = JSON.parse(result[i].json_metadata) } catch (error) { console.log(error); cb(error); }
          if(result[i].json_metadata.app && result[i].json_metadata.app.includes('musing')) {result[i].json_metadata.tags = result[i].json_metadata.appTags}
          if (!Session.get('settings').blacklist.includes(result[i].author) && result[i].json_metadata.tags.includes('steemstem'))
          {
            if(AccountHistory.find({_id:result[i].permlink}).fetch().length>0) { result[i].type = "steemstem"}
            else { result[i].type = type}
            if(Content.find( { permlink: result[i].permlink }).fetch().length>0) { continue;}
            for (var t = 0; t < result[i].json_metadata.tags.length; t++)
            {
              if (!result[i].language)  { result[i].language = FilterLanguage(result[i].json_metadata.tags[t]) }
              else                      { break; }
            }
            if (!result[i].language) { result[i].language = 'en'              }
            if (!result[i].id)       { result[i].id       = result[i].post_id }
            result[i]._id = result[i].id
            result[i].search = result[i].json_metadata.tags.join(' ')
            result[i].surl = Content.CreateUrl(result[i].author, result[i].permlink)
            Content.upsert({ _id: result[i]._id }, result[i])
          }
        }
      }
    }
  )
}

Content.getContentByAuthor = function (author, lastPermlink, cb) {
    var now = new Date();
    steem.api.getDiscussionsByAuthorBeforeDate(author, lastPermlink, dateFormat(now, "yyyy-mm-dd'T'HH:MM:ss"), 5, function (err, result) {
        console.log(err, result);
    });
}

Content.getContent = function (author, permlink,type, cb) {
    steem.api.getContent(author, permlink, function (error, result) {
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
