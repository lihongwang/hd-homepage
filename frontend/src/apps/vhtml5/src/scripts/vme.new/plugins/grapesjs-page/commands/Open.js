define([
    "handlebars",
    "skylarkjs",
    "jquery",
    'commHelpers/List',
    'server'
], function(hbs, skylarkjs, $, List, server) {
    'use strict';
    var langx = skylarkjs.langx;
    var repeaterId = "pageSRepeater";

    return function(editor, config) {
        var pfx = editor.getConfig('stylePrefix');
        var modal = editor.Modal;
        // Init import button
        var list;
        var container = document.createElement('div');
        var btnImp = document.createElement('button');
        btnImp.type = 'button';
        btnImp.innerHTML = config.modalImportButton;
        btnImp.className = pfx + 'btn-prim ' + pfx + 'btn-import';
        btnImp.onclick = function(e) {
            var item = $("#" + repeaterId).repeater('list_getSelectedItems')[0];
            if (item && item.data) {
                var content = item.data;
                var html = langx.trim(content.html);
                var func = new Function("tpl", "data", "container", content.javascript);
                var div = $("<div>");
                $('<style>' + content.css + '</style>').appendTo(div);
                func(hbs.compile(html), content.sub ? content.sub : JSON.parse(content.data), div);
                editor.setComponents(div.html());
            }
            // // server().connect("pages", "get", "show?key=id&value=" + item.data.id).then(function(page) {
            //     var mainDiv = $("<div>");
            //     page.contents.forEach(function(content) {
            //         var template = content.template;
            //         var html = langx.trim(template.html);
            //         var func = new Function("tpl", "data", "container", template.javascript);
            //         var div = $("<div>").appendTo(mainDiv);
            //         $('<style>' + template.css + '</style>').appendTo(div);
            //         func(hbs.compile(html), content.sub ? content.sub : JSON.parse(template.data), div);
            //     });

            modal.close();
            // })

        };

        return {
            run: function run(editor) {
                if (!list) {
                    list = new List({
                        title: "选择模板",
                        id: repeaterId,
                        actionName: "public",
                        list_selectable: true,
                        search: true,
                        key: "templates",
                        addBtn: false,
                        multiView: false,
                        columns: [{
                            label: '名称',
                            property: 'name',
                            sortable: false
                        }]
                    });
                    container.appendChild(list.getDom()[0]);
                    container.appendChild(btnImp);
                }
                modal.setTitle(config.modalImportTitle);
                modal.setContent(container);
                modal.open();
            },

            stop: function stop() {
                modal.close();
            }
        };
    };
});