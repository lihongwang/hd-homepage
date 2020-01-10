define([
    "./CategoriesController"
], function(Categories) {
    return Categories.inherit({
        klassName: "PostsController",
        repeaterId: "postsCategoriesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/posts",
        postAction: "post/posts",
        isSub: true,
        category: "posts"
    });
});