define([
    "./CategoriesController"
], function(Categories) {
    return Categories.inherit({
        klassName: "PagesController",
        repeaterId: "pagesCategoriesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/pages",
        postAction: "post/pages",
        isSub: true,
        category: "pages"
    });
});