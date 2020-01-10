define([
    "jquery",
    "skylarkjs",
    "handlebars",
    "lodash",
    "server",
    "scripts/helpers/modal",
    "commHelpers/Partial",
    "commHelpers/List",
    "text!scripts/helpers/_formPartial.hbs",
    "text!scripts/helpers/_itemPartial.hbs"
], function($, skylarkjs, hbs, _, server, modal, partial, List, formTpl, itemTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        itemSelector = $(langx.trim(itemTpl)),
        formSelector = $(langx.trim(formTpl));
    partial.get("category-select-partial", formSelector);
    partial.get("posts-form-partial", formSelector);
    partial.get("posts-item-partial", itemSelector);
    var tpl = hbs.compile("{{> posts-form-partial}}");
    var itemT = hbs.compile("{{> posts-item-partial}}");
    return spa.RouteController.inherit({
        klassName: "PostController",
        repeaterId: "postRepeater",
        list: null,
        title: "文章列表",
        actionName: "index",
        postAction: "create",
        addTitle: "添加文章",
        preparing: function(e) {
            var self = this;
        },

        buildList: function(post) {
            this.list = new List({
                title: this.title,
                id: this.repeaterId,
                key: "posts",
                actionName: this.actionName,
                actions: [{
                    name: "delete",
                    title: "删除",
                    callback: function() {

                    }
                }, {
                    name: "edit",
                    title: "编辑",
                    tpl: tpl,
                    callback: function() {

                    }
                }],
                columns: [{
                    label: '标题',
                    property: 'title',
                    sortable: false
                }, {
                    label: '内容摘要',
                    property: 'abstract',
                    sortable: false
                }, {
                    label: '是否公开',
                    property: 'published',
                    sortable: false
                }, {
                    label: '发布时间',
                    property: 'publishedDate',
                    sortable: true
                }, {
                    label: '创建时间',
                    property: 'createdAt',
                    sortable: false
                }]
            });
        },

        rendering: function(e) {
            this.buildList();
            var self = this,
                selector = this.list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {
                modal.show("form", $(tpl({
                    checked: true
                })), this.addTitle, {
                    key: "posts",
                    file: true,
                    action: self.postAction,
                    afterSave: function() {
                        selector.repeater('render');
                    },
                    beforeSave: function() {

                    },
                    checkKeys: ["title", "abstract"]
                });
            });
            selector.find(".repeater-refresh button").off("click").on("click", function(e) {
                selector.repeater('render');
            });
            e.content = this.list.getDom()[0];
        },

        entered: function() {},
        exited: function() {}
    });
});