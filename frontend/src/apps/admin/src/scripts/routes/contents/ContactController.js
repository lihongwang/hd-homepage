define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "ContactController",
        repeaterId: "contactContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/contact",
        postAction: "post/contact"
    });
});
