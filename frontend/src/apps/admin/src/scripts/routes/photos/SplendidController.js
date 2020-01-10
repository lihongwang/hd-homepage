define([
    "./PhotosController"
], function(Photos) {
    return Photos.inherit({
        klassName: "SplendidController",
        repeaterId: "splendidPhotosRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/splendid",
        postAction: "post/splendid"
    });
});
