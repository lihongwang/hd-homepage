define([
    "jquery",
    "skylarkjs",
    "handlebars",
    "lodash",
    "server",
    "toastr",
    "scripts/helpers/modal",
    "commHelpers/Partial",
    "commHelpers/List",
    "text!scripts/helpers/_formPartial.hbs"
], function($, skylarkjs, hbs, _, server, toastr, modalFunc, partial, List, formTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        formSelector = $(langx.trim(formTpl));
    partial.get("photos-form-partial", formSelector);
    var tpl = hbs.compile("{{> photos-form-partial}}");
    return spa.RouteController.inherit({
        klassName: "PhotosController",
        repeaterId: "photosRepeater",
        preparing: function(e) {
            var self = this;
        },

        buildList: function(pages) {
            this.list = new List({
                title: this.title || "页面列表",
                key: "photos",
                id: this.repeaterId,
                actionName: this.actionName || "index",
                postAction: this.postAction || "create",
                exceptActionRows: [],
                actions: [{
                    name: "delete",
                    title: "删除页面",
                    callback: function() {

                    }
                }, {
                    name: "edit",
                    title: "编辑",
                    tpl: tpl,
                    tplOpts: {

                    },
                    callback: function() {}
                }, {
                    name: "show",
                    title: "查看",
                    clickAction: function(helpers, callback, e) {

                    }
                }],
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortbale: true
                }]
            });
        },

        rendering: function(e) {
            this.buildList();
            var self = this,
                selector = this.list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {

                modalFunc.show("form", $(tpl({
                    isSub: self.isSub,
                    pages: self.pages
                })), "添加", {
                    key: "photos",
                    action: self.postAction,
                    beforeSave: function(extralObj) {

                    },
                    afterSave: function() {
                        selector.repeater('render');
                    },
                    modalInitEvts: function(_modal) {
                        _modal.find('[data-toggle="tab"]').each(function() {
                            var $this = $(this);
                            $this.tab();
                        });
                        _modal.find('[data-toggle="dropdown"]').dropdown();
                    }
                });
            });
            selector.find(".repeater-refresh button").off("click").on("click", function(e) {
                selector.repeater('render');
            });
            e.content = this.list.getDom()[0];
        },

        rendered: function() {

        },

        entered: function() {},
        exited: function() {}
    });
});