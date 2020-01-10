define([
    "server",
    "./PagesController"
], function(server, Pages) {
    return Pages.inherit({
        klassName: "SubController",
        repeaterId: "subPagesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/sub",
        postAction: "post/sub",
        isSub: true,
        preparing: function(e) {
            var self = this;
            e.result = server().connect("pages", "get", "select").then(function(pages) {
                self.pages = pages;
            });
        },
    });
});