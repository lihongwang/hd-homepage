define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "HomeController",
        repeaterId: "homeContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/home",
        postAction: "post/home"
    });
});
