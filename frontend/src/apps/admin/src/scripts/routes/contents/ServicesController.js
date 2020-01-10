define([
    "./ContentsController"
], function(Contents) {
    return Contents.inherit({
        klassName: "ServicesController",
        repeaterId: "servicesContentsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/services",
        postAction: "post/services"
    });
});
