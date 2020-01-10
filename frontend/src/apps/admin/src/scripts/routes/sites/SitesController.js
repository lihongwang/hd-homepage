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
    partial.get("sites-form-partial", formSelector);
    var tpl = hbs.compile("{{> sites-form-partial}}");
    return spa.RouteController.inherit({
        klassName: "SitesController",
        repeaterId: "sitesRepeater",
        preparing: function(e) {
            var self = this;
        },

        buildList: function(pages) {
            this.list = new List({
                title: this.title || "网站列表",
                key: "sites",
                id: this.repeaterId,
                exceptActionRows: [],
                actions: [{
                    name: "delete",
                    title: "删除",
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
                        var rowData = helpers.rowData;
                        var iframe = $("<iframe>").attr({ src: rowData.domain });
                        var modal = modalFunc.show("content", iframe, "网站预览", {
                            fullModal: true,
                            modalShownEvts: function(_modal) {
                                iframe.css({
                                    width: "100%",
                                    height: _modal.find(".modal-body").css({
                                        "overflow-y": "hidden"
                                    }).height()
                                });
                            }
                        });
                    }
                }, {
                    name: "publish",
                    title: "发布",
                    html: '<span class="glyphicon glyphicon-check" title="发布"></span>',
                    clickAction: function(helpers, callback, e) {
                        var rowData = helpers.rowData;
                    }
                }, {
                    name: "config",
                    html: '<span class="glyphicon glyphicon-cog" title="配置"></span>',
                    clickAction: function(helpers, callback, e) {
                        window.go("/admin/pages", true);
                    }
                }],
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortbale: true
                }, {
                    label: '个性化域名',
                    property: 'domain',
                    sortbale: false
                }]
            });
        },

        rendering: function(e) {
            this.buildList();
            var self = this,
                selector = this.list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {
                modalFunc.show("form", $(tpl({

                })), "添加", {
                    key: "sites",
                    beforeSave: function(extralObj) {

                    },
                    afterSave: function() {
                        selector.repeater('render');
                    },
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