define([
    "skylark-jquery",
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
    partial.get("pages-cog-list-item-partial", formSelector);
    partial.get("pages-cog-partial", formSelector);
    partial.get("pages-form-partial", formSelector);
    var tpl = hbs.compile("{{> pages-form-partial}}"),
        cogTpl = hbs.compile("{{> pages-cog-partial}}");

    function buildListItem(data) {
        var itemTpl = hbs.compile("{{> pages-cog-list-item-partial}}");
        return $(itemTpl(data));
    };

    function bindBtnEvts(type, selector, search) {
        modalFunc.contentListByBtn(selector, {
            key: type,
            search: search,
            listSCallback: function(modal, items, data) {
                toastr.warning("选择完后，需要点击保存按钮！");
                data.items.forEach(function(d) {
                    buildListItem(d).appendTo(selector.find("ul.lists"));
                });
            },
            list_selectable: "multi"
        });
    };

    return spa.RouteController.inherit({
        klassName: "PagesController",
        repeaterId: "pageRepeater",
        pages: null,
        list: null,
        preparing: function(e) {
            var self = this;
        },

        buildPopList: function() {

        },

        buildList: function(pages) {
            this.list = new List({
                title: this.title || "页面列表",
                key: "pages",
                id: this.repeaterId,
                actionName: this.actionName || "index",
                postAction: this.postAction || "create",
                exceptActionRows: [],
                actions: [{
                    name: "delete",
                    title: "删除页面",
                    tpl: "",
                    callback: function() {

                    }
                }, {
                    name: "edit",
                    title: "编辑",
                    tpl: tpl,
                    tplOpts: {
                        isSub: this.isSub,
                        pages: this.pages
                    },
                    callback: function() {}
                }, {
                    name: "show",
                    title: "查看",
                    clickAction: function(helpers, callback, e) {
                        var rowData = helpers.rowData;
                        var iframe = $("<iframe>").attr({ src: rowData.pathto });
                        var modal = modalFunc.show("content", iframe, "页面预览", {
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
                        // window.go("/vhtml5?pageId=" + rowData.id, true);
                    }
                }, {
                    name: "config",
                    html: '<span class="glyphicon glyphicon-cog" title="配置"></span>',
                    clickAction: function(helpers, callback, e) {
                        var pageId = helpers.rowData.id;
                        server().connect("pages", "get", "show?key=id&value=" + pageId).then(function(data) {

                            var modal = modalFunc.show("form", $(cogTpl({
                                data: data,
                                pageId: pageId
                            })), "配置页面", {
                                modalInitEvts: function(_modal) {
                                    _modal.find('[data-toggle="tab"]').each(function() {
                                        var $this = $(this);
                                        $this.tab();
                                    });
                                    _modal.find('[data-toggle="dropdown"]').dropdown();
                                },

                                modalShownEvts: function(_modal) {

                                },

                                modalHidenEvts: function(_modal) {
                                    modalFunc.contentListByBtn(ps, {}, true);
                                    modalFunc.contentListByBtn(cs, {}, true);
                                    _modal.undelegate(".remove", "click");
                                    _modal.undelegate(".up", "click");
                                    _modal.undelegate(".down", "click");
                                },

                                modalClickOkEvts: function(_modal) {
                                    var ps = _modal.find("#pSSub")
                                    var cs = _modal.find("#pSContent");
                                    var subs = [],
                                        contents = [];
                                    ps.find("li").each(function(i, el) { subs.push($(el).data("id")); })

                                    cs.find("li").each(function(i, el) { contents.push($(el).data("id")); });

                                    server().connect("pages", "post", "update", {
                                        id: pageId,
                                        subs: subs.join(","),
                                        contents: contents.join(",")
                                    }).then(function() {
                                        _modal.modal("hide");
                                        toastr.success("保存成功！");
                                    });
                                }

                            });

                            var ps = modal.find("#pSSub")
                            bindBtnEvts("pages", ps, "&search=_sub_");
                            var cs = modal.find("#pSContent");
                            bindBtnEvts("contents", cs);


                            modal.delegate(".remove", "click", function(e) {
                                $(this).parent().parent().remove();
                            });

                            modal.delegate(".up", "click", function(e) {
                                var parent = $(this).parent().parent();
                                var before = parent.prev();
                                parent.insertBefore(before);
                            });

                            modal.delegate(".down", "click", function(e) {
                                var parent = $(this).parent().parent();
                                after = parent.next();
                                parent.insertAfter(after);
                            });
                        });

                    }
                }],
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortbale: true
                }, {
                    label: '标题',
                    property: 'title',
                    sortable: false
                }, {
                    label: '路由',
                    property: 'pathto',
                    sortable: false
                }, {
                    label: '位置',
                    property: 'position',
                    sortable: true
                }]
            });
        },

        addPage: function() {

        },

        rendering: function(e) {
            this.buildList();
            var self = this,
                selector = this.list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {

                modalFunc.show("form", $(tpl({
                    isSub: self.isSub,
                    pages: self.pages
                })), "添加页面", {
                    key: "pages",
                    action: self.postAction,
                    checkKeys: ["name"],
                    beforeSave: function(extralObj) {
                        // extralObj.notUC = false;
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
            selector.on('selected.fu.repeaterList', function() {

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