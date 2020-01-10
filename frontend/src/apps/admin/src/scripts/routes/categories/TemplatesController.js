define([
    "./CategoriesController"
], function(Categories) {
    return Categories.inherit({
        klassName: "TemplatesController",
        repeaterId: "templatesCategoriesRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/templates",
        postAction: "post/templates",
        isSub: true,
        category: "templates"
    });
});