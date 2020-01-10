define([
    "./CategoriesController"
], function(Categories) {
    return Categories.inherit({
        klassName: "ContentsController",
        repeaterId: "contentsCategoriesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/contents",
        postAction: "post/contents",
        isSub: true,
        category: "contents"
    });
});