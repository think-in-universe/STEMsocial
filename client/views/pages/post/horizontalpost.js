Template.horizontalpost.rendered = function () {
    var p = $('.description.post.h.' + this.data.permlink).text().slice(0, 125);
    $('.description.post.h.' + this.data.permlink).html(p + " ...")
}

Template.horizontalpost.helpers({
    colorfromcategory : function(tags){
        var colors = Session.get('customtags')
        for (i=0; tags.length > i; i++)
        {
            if(colors.find(item => item.category === tags[i]) && tags[i] != "steemstem")
            {
                var item = colors.find(item => item.category === tags[i])
                return item.color
            }
        }
    }
})

Template.horizontalpost.events({
    'click .image': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
    'click .meta': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
    'click .header': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
    'click .wrapper': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
    'click  #vote': function (event) {
        event.preventDefault()
        event.stopPropagation();
        $('.ui.vote.modal').remove()
        $('article').append(Blaze.toHTMLWithData(Template.votemodal, { project: this }));
        $('.ui.vote.modal.' + this.permlink).modal('setting', 'transition', 'scale').modal('show')
        Template.votemodal.init()
    },
    'click .text.post': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
    'click .title.post': function (event) {
        event.preventDefault()
        FlowRouter.go('/@' + this.author + '/' + this.permlink)
    },
})