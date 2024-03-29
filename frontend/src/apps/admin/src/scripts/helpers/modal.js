define([
    "skylarkjs",
    "commHelpers/Partial",
    "commHelpers/List",
    "skylark-jquery",
    "server",
    "toastr",
    "handlebars",
    "./AceEditor",
    // "codemirror/codemirror.min",
    // "codemirror/mode/xml/xml.min",
    // "codemirror/mode/handlebars/handlebars.min",
    // "codemirror/mode/css/css.min",
    // "codemirror/mode/javascript/javascript.min"
], function(skylarkjs, partial, List, $, server, toastr, handlebars, AceEditor) {
    var __files = {},
        langx = skylarkjs.langx,
        __smdeIds = {},
        __uEExt = "mueId",
        __repeaterSelectedItems = [],
        __uid = 0,
        __embeded = {},
        __content = {};

    function parseForm(selector) {
        var data = {}
        selector.find("input").each(function() {
            if (this.type == "file") return;
            var s = $(this),
                val = s.val();
            if (this.type === "checkbox") val = s.is(":checked");
            if (s.attr("name")) data[s.attr("name")] = val;
        });
        selector.find("select").each(function() {
            var s = $(this);
            if (s.hasClass("hide")) return;
            if (s.attr("name")) data[s.attr("name")] = s.val();
        });
        selector.find("textarea").each(function() {
            var s = $(this),
                smdeId = s.attr(__uEExt),
                value;
            if (smdeId) {
                // var edit = __smdeIds[smdeId].edit;
                // value = edit.markdown(edit.value());
                var um = __smdeIds[smdeId];
                value = um.getContent();
                delete __smdeIds[smdeId];
            } else {
                value = s.val();
            }
            if (s.attr("name")) data[s.attr("name")] = value;
        });
        return data;
    };

    function save(name, selector, extralObj, callback, actionName) {
        var action = actionName || "create",
            data = {};
        var formData = new FormData();
        var parseData = parseForm(selector);
        langx.mixin(data, parseData);

        for (var key in parseData) {
            formData.append(key, parseData[key]);
        }

        for (var type in __embeded) {
            var item = __embeded[type];
            if (item) formData.append(type, item.getValue());
        }
        if (data.id) action = "update";
        //将文件信息追加到其中
        if (extralObj._file) {
            formData.append('file', extralObj._file);
            //利用split切割，拿到上传文件的格式
            var filename = extralObj._file.name;
            //使用if判断上传文件格式是否符合
            if (!(/\.(gif|jpg|jpeg|png)$/i).test(filename)) {
                return toastr.error("缩略图格式只支持gif、jpg或者png！");
            }
        }
        delete extralObj._file;
        if (extralObj._content) {
            formData.append("_content", JSON.stringify(extralObj._content));
        }
        delete extralObj._content;
        for (var key in extralObj) {
            formData.append(key, extralObj[key]);
        }

        var url = "/api/" + name + "/" + action;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var result = JSON.parse(xhr.response || xhr.responseText);
                    if (result.status) {
                        callback(result.result);
                    } else {
                        if (result.auth) {
                            toastr.error("未登录或者session失效，请登录后再操作！");
                            window.go("/sigin");
                        } else if (result.validate) {
                            toastr.error("数据已存在：(" + result.key + ":" + result.value + ")");
                        } else {
                            toastr.error("系统错误，请截图并联系管理员，谢谢合作！");
                        }
                    }
                } else {
                    toastr.error("系统错误，请请截图并联系管理员，谢谢合作！");
                    // selector.modal('hide');
                }
            }
        };
        xhr.send(formData);
    };

    function buildList(obj, opts, callback, actionName) {
        // opts: {search, list_selectable}
        var list = new List({
            title: obj.title,
            id: obj.id,
            actionName: actionName,
            search: opts.search,
            list_selectable: opts.list_selectable,
            key: obj.type,
            addBtn: false,
            multiView: false,
            columns: obj.columns
        });
        callback(list);
    };

    function resizeModal(modal) {
        var w, h,
            mhh = modal.find(".modal-header").height(),
            mfh = modal.find(".modal-footer").height();
        if (modal.hasClass("fullscreen")) {
            w = $(window).width();
            h = $(window).height() - mhh - mfh;
            modal.find(".modal-body").css({
                "height": h + "px",
                "overflowY": 'auto'
            });
        } else {
            modal.find(".modal-body").css({
                "overflowY": 'hidden'
            });
        }
        var editorC = modal.find(".textarea-editable");
        var size = editorC.size();
        var tSize = editorC.find(".edui-toolbar").size();
        if (size) {
            editorC.find(".edui-container").css({
                width: size.width + 'px',
                overflow: "hidden"
            });
            var h = size.height - tSize.height;
            editorC.find(".editable").css({
                width: (size.width - 30) + 'px',
                height: h + "px !important",
                overflowX: 'hidden',
                overflowY: 'auto'
            });
        }
        modal.find(".repeater").repeater('render');
    };

    function formatDate(date, split, moment) {
        var split = split || "-",
            padTwo = function(value) {
                var s = '0' + value;
                return s.substr(s.length - 2);
            };
        moment = moment || this.moment;
        if (this.moment) {
            return moment(date).format(this.momentFormat);
        } else {
            return date.getFullYear() + split + padTwo(date.getMonth() + 1) + split + padTwo(date.getDate());
        }
    };

    function showList(formModal, type, opts, actionName) {
        opts.saveWithContent = opts.saveWithContent == false ? false : true;
        // opts: {search, list_selectable, key, listSCallback}
        var data = {
            posts: {
                type: "posts",
                title: "选择文章列表",
                id: "selectPostListR",
                columns: [{
                    label: '标题',
                    property: 'title',
                    sortable: false
                }],
                label: "title",
                fields: ["id", "title"]
            },
            pages: {
                type: "pages",
                title: "选择子页面",
                id: "selectSubPageListR",
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortable: false
                }],
                label: "title",
                fields: ["id", "name"]
            },
            contents: {
                type: "contents",
                title: "选择模板内容",
                id: "selectContentListR",
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortable: false
                }],
                label: "title",
                fields: ["id", "name"]
            },
            photos: {
                type: "photos",
                title: "选择图片列表",
                id: "selectPostListR",
                columns: [{
                    label: '图片',
                    property: 'src',
                    sortable: true
                }],
                label: "src",
                fields: ["id", "src", "category"]
            },
            templates: {
                type: "templates",
                title: "选择模板",
                id: "selectTplListR",
                columns: [{
                    label: '名称',
                    property: 'name',
                    sortable: true
                }],
                label: "name",
                fields: ["id", "name"]
            }
        }
        var cmodal = $("#chooseModal");
        bindModalFullEvt(cmodal, {});
        cmodal.find(".modal-title").html(data[type].title);
        cmodal.off('hidden.bs.modal').on('hidden.bs.modal', function() {
            __repeaterSelectedItems = [];
            cmodal.find(".modal-body").empty();
        });
        cmodal.off('shown.bs.modal').on('shown.bs.modal', function() {
            buildList(data[type], opts, function(list) {
                var s = list.getDom();

                s.on("selected.fu.repeaterList", function(e, data) {
                    var item_data = $(data).data("item_data");

                    if (item_data) {
                        var result = __repeaterSelectedItems.filter(function(i) {
                            return i.id === item_data.id;
                        });
                        if (!result.length) __repeaterSelectedItems.push(item_data);
                    }
                })

                s.on("deselected.fu.repeaterList", function(e, data) {
                    var item_data = $(data).data("item_data");
                    _.remove(__repeaterSelectedItems, function(item) {
                        return item.id == item_data.id;
                    });
                });
                s.on("rendered.fu.repeater", function() {
                    s.repeater('list_setSelectedItems', __repeaterSelectedItems.map(function(item) {
                        return { property: 'id', value: item.id };
                    }), true);
                    $.material.checkbox();
                });

                cmodal.find(".modal-body").html(s);
                cmodal.find(".save-btn").off("click").on("click", function() {
                    var items = __repeaterSelectedItems;
                    var optionData = data[type];
                    if (items.length) {
                        if (opts.saveWithContent) {
                            __content[opts.key] = {
                                type: type,
                                items: items.map(function(item) {
                                    var ret = {};
                                    optionData.fields.forEach(function(f) {
                                        ret[f] = item[f];
                                    });
                                    return ret;
                                })
                            };
                        }
                        var formatData = __content[opts.key] || {};
                        var ul = formModal.find(".select-content-results ul").empty();
                        items.forEach(function(item) {
                            var iContent;
                            if (optionData.label == "src") {
                                iContent = $("<img>").attr({
                                    class: "mini-img result-ic",
                                    src: item.src
                                })
                            } else {
                                iContent = $("<span>").attr({
                                    class: "result-ic"
                                }).text(item[optionData.label])
                            }
                            $("<li>").attr({
                                class: "result-item"
                            }).html(iContent).appendTo(ul);
                        });
                        if (opts.listSCallback) opts.listSCallback(formModal, items, formatData, optionData);
                        cmodal.modal("hide");
                    } else {
                        toastr.warning("请选择一项！");
                    }
                });
            }, actionName);
        });
        cmodal.modal('show');
    };

    var __validates = {
        name: {
            emptyMsg: "名称不能为空",
            numsMsg: "用户名不能少于6位",
            numlMsg: "用户名不能多于14位",
            snMsg: "用户名必须以字母开头",
            validateMsg: "用户名不能包含字符",
            check: function(modal) {
                var _us = modal.find("input[name=name]");
                if (!_us.val()) {
                    //     if (value.length < 6) {
                    //         _us.focus();
                    //         return { error: true, msg: this.numsMsg };
                    //     }
                    //     if (value.length > 14) {
                    //         _us.focus();
                    //         return { error: true, msg: this.numlMsg };
                    //     }
                    //     if (!value.match(/^[a-zA-Z0-9]+$/)) {
                    //         _us.focus();
                    //         return { error: true, msg: this.validateMsg };
                    //     }
                    //     if (value.match(/^[^a-zA-Z]/)) {
                    //         _us.focus();
                    //         return { error: true, msg: this.snMsg };
                    //     }
                    // } else {
                    _us.focus();
                    return { error: true, msg: this.emptyMsg };
                }
                return { error: false };
            }
        },
        title: {
            emptyMsg: "标题不能为空",
            check: function(modal) {
                var _us = modal.find("input[name=title]");
                if (!_us.val()) {
                    _us.focus();
                    return { error: true, msg: this.emptyMsg };
                }
                return { error: false };
            }
        },
        abstract: {
            emptyMsg: "摘要不能为空",
            check: function(modal) {
                var _us = modal.find("textarea[name=abstract]");
                if (!_us.val()) {
                    _us.focus();
                    return { error: true, msg: this.emptyMsg };
                }
                return { error: false };
            }
        },
    };

    function contentListBySelect(selector, opts, off) {
        selector.find("select.muti-content").each(function() {
            var s = $(this);
            s.off("change");
            if (!off) s.on("change", function() {
                var value = this.value;
                server().connect(value, "get", "select").then(function(data) {
                    // opts: {search, list_selectable, key, listSCallback}
                    showList(selector, value, {
                        key: opts.key,
                        search: opts.search ? opts.search : false, // data-search="k,id,v,1"由页面传入，过滤结果
                        list_selectable: opts.list_selectable || "multi",
                        listSCallback: opts.listSCallback
                    });
                });
            });
        });
    };

    function contentListByBtn(selector, opts, off) {
        var _s = selector.find("button.select-content-list");
        _s.off("click");
        if (off) return;
        _s.on("click", function(e) {
            var data = $(e.currentTarget).data();
            // opts: {search, list_selectable, key, listSCallback}
            showList(selector, data.type, {
                key: data.key || opts.key,
                saveWithContent: data.save == false ? false : true,
                search: data.search ? data.search : false,
                list_selectable: data.list_selectable || "multi",
                listSCallback: opts.listSCallback
            }, data.action);
        });
    };

    function toggleRelated(selector) {
        selector.find("select.related").each(function() {
            var s = $(this),
                related = s.data("related");
            if (related) {
                var r = related.split("@");
                var subSC = $(r[0]);
                s.off("change").on("change", function() {
                    if (this.value === r[1]) {
                        server().connect(r[2], "get", "select").then(function(data) {
                            var subS = subSC.find("select").empty();
                            data.forEach(function(d) {
                                $("<option>").attr({
                                    value: d.id
                                }).text(d.title).appendTo(subS);
                            });
                            subSC.removeClass("hide").find("select").removeClass("hide");
                        });
                    } else {
                        subSC.addClass("hide").find("select").addClass("hide");
                    }
                })
            }
        });
    };

    function bindFormEvnts(modal, opts, off) {
        contentListBySelect(modal, opts, off);
        toggleRelated(modal);
        contentListByBtn(modal, opts, off);
        bindEditor(modal, opts);
    };

    function bindEditor(modal, opts) {
        __embeded = {};
        var smde = modal.find("#simplemde");
        if (smde[0]) {
            __uid += 1;
            var editorUid = __uEExt + __uid;
            __smdeIds[editorUid] = UM.getEditor("simplemde", {}, true);
            smde.attr(__uEExt, editorUid);
        }
        if (modal.find("#embeded").length) {
            // var htmlS = modal.find("#html textarea");
            // __embeded["html"] = CodeMirror.fromTextArea(htmlS[0], {
            //     lineNumbers: true,
            //     mode: { name: "handlebars", base: "text/html" },
            //     theme: "monokai"
            // });
            // var cssS = modal.find("#css textarea");
            // __embeded["css"] = CodeMirror.fromTextArea(cssS[0], {
            //     mode: "css",
            //     lineNumbers: true,
            //     theme: "monokai"
            // });
            // var jsS = modal.find("#javascript textarea");
            // __embeded["javascript"] = CodeMirror.fromTextArea(jsS[0], {
            //     mode: "javascript",
            //     lineNumbers: true,
            //     theme: "monokai"
            // });
            // var dS = modal.find("#data textarea");
            // __embeded["json"] = CodeMirror.fromTextArea(dS[0], {
            //     mode: "javascript",
            //     lineNumbers: true,
            //     theme: "monokai"
            // });


            var htmlS = modal.find("#html");
            __embeded.html = new AceEditor({
                node: htmlS[0],
                type: "html",
                theme: "solarized_light",
                value: htmlS.find("textarea").val()
            });
            var cssS = modal.find("#css");
            __embeded.css = new AceEditor({
                node: cssS[0],
                type: "css",
                theme: "solarized_dark",
                value: cssS.find("textarea").val()
            });
            var jsS = modal.find("#javascript");
            __embeded.javascript = new AceEditor({
                node: jsS[0],
                type: "javascript",
                theme: "monokai",
                value: jsS.find("textarea").val()
            });
            var dS = modal.find("#data");
            __embeded.data = new AceEditor({
                node: dS[0],
                type: "json",
                theme: "mono_industrial",
                value: dS.find("textarea").val()
            });
        }
    }

    function checkForm(keys, modal, validates) {
        validates = validates || __validates;
        var status = true;
        for (var i in keys) {
            var key = keys[i];
            if (validates[key]) {
                var result = validates[key].check(modal);
                if (result.error) {
                    toastr.error(result.msg);
                    status = false;
                    break;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        };
        return status;
    };

    function removeClickEvt(modal) {
        modal.find(".save-btn").off("click");
    }

    var modalFuncs = {
        buildList: buildList,
        _showForm: function(content, title, opts) {
            var modal = $("#formModal");
            opts.file = opts.file === false ? false : true;
            modal.find(".modal-body").empty().html(content);
            modal.find(".modal-title").empty().html(title);

            modal.off('shown.bs.modal').on('shown.bs.modal', function() {
                resizeModal(modal);
                window.onresize = function(event) {
                    resizeModal(modal);
                };
                $.material.init();
                if (opts.modalShownEvts) opts.modalShownEvts(modal);

            });

            modal.off('hidden.bs.modal').on('hidden.bs.modal', function() {
                removeClickEvt(modal);
                if (opts.modalHidenEvts) opts.modalHidenEvts(modal);
            });

            modal.find("#datepickerIllustration").datepicker({
                allowPastDates: true,
                formatDate: formatDate
            });
            modal.find(".save-btn").off("click").on("click", function(e) {
                if (opts.modalClickOkEvts) {
                    opts.modalClickOkEvts(modal, e);
                } else {
                    var extralObj = {
                        _content: __content[opts.key],
                        _file: __files[opts.key]
                    };
                    if (opts.beforeSave) opts.beforeSave(extralObj);
                    if (checkForm(opts.checkKeys || [], modal)) {
                        save(opts.key, modal, extralObj, function(data) {
                            __content[opts.key] = null;
                            __files[opts.key] = null;
                            toastr.success("已保存！");
                            if (opts.afterSave) opts.afterSave(data);
                            modal.modal('hide');
                        }, opts.action);
                    }
                }
            });

            if (opts.file) {
                modal.find(".form input.file").on("change", function(e) {
                    __files[opts.key] = this.files[0];
                });
            }
            if (opts.bindFormEvnts != false) bindFormEvnts(modal, opts);
            if (opts.modalInitEvts) opts.modalInitEvts(modal);
            modal.modal({
                backdrop: "static",
                show: true
            });
            return modal;
        },

        _showContent: function(content, title, opts) {
            var modal = $("#contentModal");
            modal.off('shown.bs.modal').on('shown.bs.modal', function() {
                resizeModal(modal);
                window.onresize = function(event) {
                    resizeModal(modal);
                };
                $.material.init();
                if (opts.modalShownEvts) opts.modalShownEvts(modal);
            });
            modal.find(".modal-body").empty().html(content);
            modal.find(".modal-title").empty().html(title);
            modal.modal('show');
            return modal;
        },
        _showDelete: function(content, title, opts) {
            var modal = $("#confirmDeleteModal");
            modal.find(".modal-title").empty().html(title);
            modal.find(".btn-ok").off("click").on("click", function() {
                server().connect(opts.key, "post", "delete", {
                    id: opts.id
                }).then(function() {
                    if (opts.callback) opts.callback();
                    modal.modal('hide');
                });
            })
            modal.modal('show');
            return modal;
        }
    };

    function unFullModal(modal) {
        modal.find(".btn-full").removeClass("full").text("全屏");
        modal.removeClass("fullscreen");
        resizeModal(modal);
    };

    function fullModal(modal) {
        modal.find(".btn-full").addClass("full").text("取消全屏");
        modal.addClass("fullscreen");
        resizeModal(modal);
    };

    function bindModalFullEvt(modal, opts) {
        opts = opts || {};
        if (opts.fullModal) {
            fullModal(modal);
        } else {
            unFullModal(modal);
        }
        modal.find(".btn-full").off("click").on("click", function() {
            var s = $(this);
            if (s.hasClass("full")) {
                s.removeClass("full");
                s.text("全屏");
                modal.removeClass("fullscreen");
            } else {
                s.addClass("full");
                s.text("取消全屏");
                modal.addClass("fullscreen");
            }
            resizeModal(modal);
        });
    };

    return {
        formatDate: formatDate,
        contentListByBtn: contentListByBtn,
        contentListBySelect: contentListBySelect,
        parseForm: parseForm,
        addValidate: function(key, opts) {
            __validates[key] = opts;
        },
        showList: showList,
        checkForm: checkForm,
        bindFormEvnts: bindFormEvnts,
        save: save,
        unFullModal: unFullModal,
        fullModal: fullModal,
        show: function(type, content, title, opts) {
            var modal;
            switch (type) {
                case "form":
                    modal = modalFuncs._showForm(content, title, opts);
                    break;
                case "content":
                    modal = modalFuncs._showContent(content, title, opts);
                    break;
                default:
                    modal = modalFuncs._showDelete(content, title, opts);
                    break;
            }
            bindModalFullEvt(modal, opts);
            return modal;
        }
    }
});