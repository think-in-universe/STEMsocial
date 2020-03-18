// Rendering
Template.drafts.rendered = function ()
  { $('.ui.tiny.image img').visibility({ type: 'image', transition: 'fade in', duration: 1000 }); }

Template.drafts.events({
  'click #remove-draft': function (event) 
  {
    event.preventDefault();
    event.stopPropagation();
    Template.drafts.removeDraft(this);
  },
  'click .ui.item.draft': function (event)
  {
    event.preventDefault();
    Template.create.loadDraft(this);
  }
});

Template.drafts.addToDraft = function(form){
    var draft = {
      title         : form.title.value,
      body          : form.body.value,
      tags          : form.tags.value,
      beneficiaries : form.beneficiaries.value,
      last_update : Date.now()
    }
    // Get the custom json id

    return;
    steem.api.getAccountHistory(localStorage.username,0,10000, function(err, res)
    {
       if (err) {console.log('error with account history: ', err); return; }
       for (let i = 0; i<res.length; i++)
       {
          console.log(i, res[i][1].op[0]);
       }
    });

    if(!localStorage.drafts) { localStorage.setItem('drafts', JSON.stringify([draft])); }
    else
    {
       console.log('userdata =' , localStorage.drafts);
       let userdata = JSON.parse(localStorage.drafts);
       console.log('parsed userdata =' , userdata);
       userdata.append(draft);
       console.log('new userdata =' , userdata);
    }

    console.log('userdata = ', localStorage.drafts);
    if(userdata)
    {
        console.log('we have some userdata')
        var drafts = []
        if(userdata.includes('drafts'))
            drafts = userdata.drafts
        for (var i=0; i<drafts.length; i++)
          { if (JSON.stringify(drafts[i]) === JSON.stringify(Session.get('loaded-draft')))  { drafts.splice(i, 1); break; } }
        drafts.push(draft)
        userdata.drafts = drafts
    }
    else
    {
        userdata = []
        userdata.push({ drafts: [draft] } );
    }
    steemconnect.updateUserMetadata(userdata,function(error){
        if(error)
        {
            console.log('err = ', error)
        }
        else console.log('success')
    })
    Template.create.loadDraft(draft)
}

Template.drafts.removeDraft = function(draft){
    var userdata = Session.get('userdata')
    userdata.drafts = userdata.drafts.filter(function(el) {
        return el.body !== draft.body;
    });
    steemconnect.updateUserMetadata(userdata,function(error){
        if(error)
        {
            console.log(error)
        }
    })
}
