define([
    "./PhotosController"
], function(Photos) {
    return Photos.inherit({
        klassName: "SlidesController",
        repeaterId: "slidesPhotosRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/slides",
        postAction: "post/slides"
    });
});
