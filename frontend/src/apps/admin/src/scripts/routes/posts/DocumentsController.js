define([
    "./PostsController"
], function(Posts) {
    return Posts.inherit({
        klassName: "DocumentsController",
        repeaterId: "documentsPostsRepeater",
        title: "列表",
        addTitle: "添加",
        actionName: "public/documents",
        postAction: "post/documents"
    });
});
