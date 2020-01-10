define([
    "./CategoriesController"
], function(Categories) {
    return Categories.inherit({
        klassName: "PhotosController",
        repeaterId: "photosCategoriesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/photos",
        postAction: "post/photos",
        isSub: true,
        category: "photos"
    });
});