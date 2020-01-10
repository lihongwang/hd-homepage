define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "DevelopmentController",
        repeaterId: "developmentContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/development",
        postAction: "post/development"
    });
});