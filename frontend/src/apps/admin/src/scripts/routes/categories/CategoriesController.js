define([
    "jquery",
    "skylarkjs",
    "handlebars",
    "lodash",
    "server",
    "scripts/helpers/modal",
    "commHelpers/Partial",
    "commHelpers/List",
    "text!scripts/helpers/_formPartial.hbs"
], function($, skylarkjs, hbs, _, server, modal, partial, List, formTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        formSelector = $(langx.trim(formTpl));
    partial.get("category-select-partial", formSelector);
    partial.get("category-form-partial", formSelector);
    var tpl = hbs.compile("{{> category-form-partial}}");
    return spa.RouteController.inherit({
        klassName: "CategoriesController",
        repeaterId: "categoriesRepeater",
        category: "categories",
        isSub: false,
        catList: [],
        buildList: function(post) {
            return new List({
                title: "分类列表",
                id: this.repeaterId,
                key: "categories",
                actionName: this.actionName || "index",
                postAction: this.postAction || "create",
                actions: [{
                    name: "delete",
                    title: "删除",
                    tpl: "",
                    callback: function() {

                    }
                }, {
                    name: "edit",
                    title: "编辑",
                    tpl: tpl,
                    tplOpts: {
                        isSub: this.isSub
                    },
                    callback: function() {

                    }
                }],
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortable: true
                }, {
                    label: '中文名称',
                    property: 'display',
                    sortable: true
                }, {
                    label: '类型',
                    property: 'category',
                    sortable: false
                }]
            });
        },

        rendering: function(e) {
            var list = this.buildList();
            var self = this,
                selector = list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {
                modal.show("form", $(tpl({
                    isSub: self.isSub,
                    category: self.category === "categories" ? null : self.category
                })), "添加分类", {
                    list_selectable: "multi",
                    key: "categories",
                    file: true,
                    action: self.postAction || "create",
                    checkKeys: ["name"],
                    beforeSave: function(extralObj) {

                    },
                    afterSave: function() {
                        selector.repeater('render');
                    },
                    listSCallback: function(modal, items) {

                    }
                });
            });
            selector.find(".repeater-refresh button").off("click").on("click", function(e) {
                selector.repeater('render');
            });
            e.content = list.getDom()[0];
        },

        entered: function() {},
        exited: function() {}
    });
})