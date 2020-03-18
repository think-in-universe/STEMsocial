// Creating a MongoDB for storing the user's blog content
Blog = new Mongo.Collection(null)

// Method to get the user's blog content from the Steem blockchain
Blog.getContentByBlog = function (name, limit, type, cb, link='', author='') {
  // Limit to the first 50 entries. Otherwise, we need to complete what we already got
  if(Blog.find( { type:type, from: name}).fetch().length>50 && link=='' && author=='') return;
  var query = { tag: name, limit: limit };
  if(link!='' && author!='') {query = {  tag: name, limit: limit, start_author:author, start_permlink:link } }

  // Getting the content
  steem.api.getDiscussionsByBlog(query, function (error, result) {
    if (!result) return cb(error)
    else
    {
      // Containers to store the last entry
      var lastlink   = '';
      var lastauthor = '';

      // Processing the results and adding them to the Mongo DB (adding a few useful attributes)
      for (var i = 0; i < result.length; i++)
      {
        try { result[i].json_metadata = JSON.parse(result[i].json_metadata) } catch (error) { console.log(error); cb(error); }
        result[i].type = type
        result[i].from = name
        lastlink   = result[i].permlink
        lastauthor = result[i].author
        if (!result[i].json_metadata.tags || (typeof result[i].json_metadata.tags==='string')) { result[i].json_metadata.tags = [] }
        else { result[i].search = result[i].json_metadata.tags.join(' ') }
        result[i].surl = Content.CreateUrl(result[i].author, result[i].permlink)
        if (!result[i].id) { result[i].id = result[i].post_id }
        Blog.upsert({ _id: result[i].id }, result[i])
      }

      // Verifying whether we got the entire blog.
      // If not, asking for more content to complete a singke page (76 entries per page).
      if(result.length<limit) { Session.set('Query-done', true); }
      if(result.length>0 && (Blog.find( { type:type, from: name}).fetch().length<76) && !Session.get('Query-done'))
         { Blog.getContentByBlog(name,limit,type,cb,lastlink, lastauthor); }
    }
  });
}
