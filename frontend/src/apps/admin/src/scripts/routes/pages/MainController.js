define([
    "./PagesController"
], function(Pages) {
    return Pages.inherit({
        klassName: "MainController",
        repeaterId: "mainPagesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/main",
        postAction: "post/main"
    });
});
