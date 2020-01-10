define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "TechnicalController",
        repeaterId: "technicalContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/technical",
        postAction: "post/technical"
    });
});