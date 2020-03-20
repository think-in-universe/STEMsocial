// Creating a MongoDB for storing the user's blog content
Blog = new Mongo.Collection(null)

// Method to get the user's blog content from the Steem blockchain
Blog.getContentByBlog = function (name, limit, type, link='', author='')
{
  // If done
  if(Session.get('blog_loaded')) return;

  // Setup
  Session.set('blog_author', name);

  // Getting the right query
  let query = { tag:name, limit:limit };
  if(link!='' && author!='') query = {  tag:name, limit:limit, start_author:author, start_permlink:link };

  // Getting the content
  steem.api.getDiscussionsByBlog(query, (err, res)=>
  {
    // Error and empty lists
    if (!res) { console.log('Steem API error (getDiscussionsByBlog): ', err, '(query:', query, ')' ); return; }
    if(name && res.length==0) { Session.set('blog_loaded', true); return; }

    // Processing the results and adding them to the DB (plus a few useful attributes)
    for (let i=0; i<res.length; i++)
    {
        // Check whether the post is properly formatted (otherwise skip)
        if (!res[i].json_metadata) continue;

        // Adding attributes
        res[i].json_metadata = JSON.parse(res[i].json_metadata);
        res[i].type = type;
        res[i].from = name;
        if (!res[i].json_metadata.tags || (typeof res[i].json_metadata.tags==='string')) res[i].json_metadata.tags = [];
        else { res[i].search = res[i].json_metadata.tags.join(' '); }
        res[i].surl = Content.CreateUrl(res[i].author, res[i].permlink);
        if (!res[i].id) res[i].id = res[i].post_id;

        // Saving the blog post
        Blog.upsert({ _id: res[i].id }, res[i]);
    }
    if(res.length<limit) Session.set('blog_loaded', true);

    // Setup
    Session.set('last_blog_author', res[res.length-1].author);
    Session.set('last_blog_permlink', res[res.length-1].permlink);

    return;

  });
}


// Updating the blog content
Blog.UpdateBlog = function (page_number)
{
  // Do we need to load more
  let author = Session.get('blog_author');
  if (-1==page_number)
    Blog.getContentByBlog(author, 2*Session.get('blogs_per_page')+1, 'blog',
       Session.get('last_blog_permlink'), Session.get('last_blog_author'));
  else if (Blog.find({from:author}).fetch().length/Session.get('blogs_per_page') == page_number)
    Blog.getContentByBlog(author, Session.get('blogs_per_page')+1, 'blog',
       Session.get('last_blog_permlink'), Session.get('last_blog_author'));
  return;
}

