// Links for the about us, the FAQ and the TOS
Template.footer.events({
    'click .item.about': function (event) {
        event.preventDefault()
        FlowRouter.go('/aboutus')
    },
    'click .item.faq': function (event) {
        event.preventDefault()
        FlowRouter.go('/faq')
    },
    'click .item.tos': function (event) {
        event.preventDefault()
        FlowRouter.go('/tos')
    }
})
