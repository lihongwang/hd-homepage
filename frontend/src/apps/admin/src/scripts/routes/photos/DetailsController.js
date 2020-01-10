define([
    "./PhotosController"
], function(Photos) {
    return Photos.inherit({
        klassName: "DetailsController",
        repeaterId: "detailsPhotosRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/details",
        postAction: "post/details"
    });
});
