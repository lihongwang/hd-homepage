define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "AboutController",
        repeaterId: "aboutContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/about",
        postAction: "post/about"
    });
});
