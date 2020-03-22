define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "SoftwareProductController",
        repeaterId: "softwareProductContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/softwareProduct",
        postAction: "post/softwareProduct"
    });
});
