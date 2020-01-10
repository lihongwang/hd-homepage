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
    "scripts/helpers/tpl",
    "scripts/helpers/jsonForm/main",
    "scripts/helpers/jsonForm/utils",
    "text!scripts/helpers/_formPartial.hbs",
    "scripts/helpers/jsonForm/bsExt"
], function($, skylarkjs, hbs, _, server, toastr, modalFunc, partial, List, tplHelper, BrutusinForms,
    jsonFormUtils, formTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        formSelector = $(langx.trim(formTpl));
    partial.get("contents-select-partial", formSelector);
    partial.get("contents-form-partial", formSelector);
    var tpl = hbs.compile("{{> contents-form-partial}}"),
        __tplId,
        __bf,
        __currentTplKey = null,
        wizardTpl = hbs.compile("{{> wizard-tpl-partial}}");
    return spa.RouteController.inherit({
        klassName: "ContentsController",
        repeaterId: "contentsRepeater",
        list: null,
        title: "页面模板内容列表",
        addTitle: "添加页面模板内容",
        postAction: "create",
        actionName: "index",
        selectContents: [],
        preparing: function(e) {
            var self = this;
            e.result = server().connect("categories", "get", "select").then(function(cats) {
                self.selectContents = cats;
            });
        },

        buildList: function(post) {
            var self = this,
                list = this.list = new List({
                    title: this.title || "模板内容",
                    id: this.repeaterId,
                    key: "contents",
                    actionName: this.actionName,
                    actions: [{
                        name: "delete",
                        title: "删除模板",
                        tpl: "",
                        callback: function() {

                        }
                    }, {
                        name: "edit",
                        title: "编辑",
                        tpl: tpl,
                        clickAction: function(helpers, callback, e) {
                            var _data = langx.mixin(langx.clone(helpers.rowData), {
                                selectContents: self.selectContents
                            });
                            if (_data.publishedDate) _data.publishedDate = formatDate(_data.publishedDate);
                            var wizard = self.initWizard(_data);
                            var tplData = {};
                            if (_data.template && _data.template.data) tplData = JSON.parse(_data.template.data);
                            if (_data.sub) self.bindBuildFormEvt(wizard, tplData, _data.sub);
                            $("<li>").attr({
                                class: "result-item"
                            }).html("<span>" + _data.template.name + "</span>").appendTo(wizard.find(".select-content-results ul").empty());
                        }
                    }],
                    columns: [{
                        label: '名称',
                        property: 'name',
                        sortable: true
                    }]
                });
        },

        bindRowData: function(wizard, contentData) {
            // var select = wizard.find(".cnt-select-form").removeClass("hide").find("select"),
            var select = wizard.find(".contentSelect select");
            // fillItem = function(selector, items) {
            //     var ul = $("<ul>").appendTo(selector);
            //     items.forEach(function(item) {
            //         var iContent;
            //         if (item.src) {
            //             iContent = $("<img>").attr({
            //                 class: "mini-img result-ic",
            //                 src: item.src
            //             });
            //         } else {
            //             iContent = $("<span>").attr({
            //                 class: "result-ic"
            //             }).text(item.title || item.name || "");
            //         }
            //         $("<li>").attr({
            //             class: "result-item"
            //         }).html(iContent).appendTo(ul);
            //     });
            // }
            // $("<option>").attr({
            //     value: ""
            // }).text("-请选择-").appendTo(select);
            // this.selectContents.forEach(function(c) {
            //     $("<option>").attr({
            //         value: c.name
            //     }).text(c.display).appendTo(select);
            // });

            select.off("change").on("change", function(e) {
                // var schemaId = e.currentTarget.schema;
                // var s = jsonFormUtils.getSchema(schemaId);
                // var parentData = jsonFormUtils.getData();
                var data = $(this).val();
                if (data) {
                    data = data.split("-");
                    modalFunc.showList(wizard, data[0], {
                        key: "contents",
                        search: false,
                        saveWithContent: false,
                        list_selectable: "multi",
                        listSCallback: function(formModal, items, formatData) {
                            if (e.currentTarget._csCallback) e.currentTarget._csCallback(items);
                            // var listS = $(e.currentTarget).parent().parent().next(".list-contents");
                            // var itemIndex = listS[0].getAttribute("itemIndex");
                            // parentData.items[itemIndex].contents = items;
                            // jsonFormUtils.setData(parentData);
                            // fillItem(listS.find(".prop-value"), items);
                        }
                    }, "public/" + data[1])
                }
            });
        },

        bindBuildFormEvt: function(wizard, data, value) {
            var self = this;
            wizard.find(".build-form").removeClass("hide").find("#buildForm").off("click").on("click", function(e) {
                __bf = BrutusinForms.create(data.schema, self.selectContents);
                wizard.wizard("next");
                var subForm = wizard.find(".sub-container");
                __bf.render(subForm[0], value || {});
                self.bindRowData(subForm, data);
            });
        },

        initWizard: function(formData) {
            var self = this;
            var obj = {
                id: "contentWizard",
                steps: [{
                        step: 1,
                        stepBadge: 1,
                        stepLabel: '基本内容',
                        active: true,
                        title: '基本内容',
                        content: $(tpl(formData))[0].outerHTML,
                        beforeAction: function(e, _modal) {
                            if (!modalFunc.checkForm(["name"], _modal)) {
                                e.preventDefault();
                            }
                        }
                    },
                    {
                        step: 2,
                        stepBadge: 2,
                        stepLabel: '模板内容',
                        styles: 'bg-info alert',
                        title: '',
                        content: "<div class='sub-container'></div>",
                        afterAction: function(e, _modal) {

                        }
                    }
                ]
            };
            var wizard = $(wizardTpl(obj)).wizard(),
                modal = modalFunc.show("form", wizard, this.addTitle, {
                    key: "contents",
                    file: true,
                    action: self.postAction,
                    listSCallback: function(formModal, items, formatData) {
                        var item = items[0];
                        if (item) {
                            __tplId = item.id;
                            item.data;
                            // 处理json to form
                            var data = JSON.parse(item.data);
                            if (data.buildForm) self.bindBuildFormEvt(wizard, data);
                            if (data.rowData) self.bindRowData(wizard, data);
                        }
                    },

                    modalHidenEvts: function(_modal) {
                        __bf = null;
                        __tplId = null;
                        __currentTplKey = null;
                    },

                    beforeSave: function(extralObj) {
                        if (__bf) {
                            extralObj.sub = JSON.stringify(__bf.getData());
                        }
                        if (__tplId) extralObj.templateId = __tplId;
                    },
                    afterSave: function() {
                        self.list.getDom().repeater('render');
                    }
                });

            wizard.on('finished.fu.wizard', function() {
                modalFunc.save("contents", modal, {
                    templateId: __tplId
                }, function(data) {
                    modal.modal("hide");
                    selector.repeater('render');
                    toastr.success("已保存！");
                }, this.postAction);
            }).on('actionclicked.fu.wizard', function(e, data) {
                var config = obj.steps.filter(function(s) { return s.step === data.step; })[0];
                if (config.beforeAction) config.beforeAction(e, modal);
            }).on('changed.fu.wizard', function(e, data) {
                var config = obj.steps.filter(function(s) { return s.step === data.step; })[0];
                if (config.afterAction) config.afterAction(e, modal);
            });
            return wizard;
        },

        rendering: function(e) {
            this.buildList();
            var self = this,
                selector = this.list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {
                self.initWizard({
                    selectContents: self.selectContents,
                    checked: true
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