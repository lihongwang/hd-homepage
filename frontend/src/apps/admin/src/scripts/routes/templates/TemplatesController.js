define([
    "skylark-jquery",
    "skylarkjs",
    "handlebars",
    "server",
    "commHelpers/List",
    "scripts/helpers/modal",
    "commHelpers/Partial",
    "commHelpers/tplHelper",
    "text!scripts/routes/templates/templates.hbs",
    "text!scripts/helpers/_formPartial.hbs"
], function($, skylarkjs, hbs, server, List, modalFunc, partial, tplHelper, template, formTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        __selector = $(langx.trim(template)),
        formSelector = $(langx.trim(formTpl));
    partial.get("templates-form-partial", formSelector);
    var tpl = hbs.compile("{{> templates-form-partial}}");
    String.prototype.regexIndexOf = function(regex, startpos) {
        var indexOf = this.substring(startpos || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
    }

    String.prototype.regexLastIndexOf = function(regex, startpos) {
        regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
        if (typeof(startpos) == "undefined") {
            startpos = this.length;
        } else if (startpos < 0) {
            startpos = 0;
        }
        var stringToWorkWith = this.substring(0, startpos + 1);
        var lastIndexOf = -1;
        var nextStop = 0;
        while ((result = regex.exec(stringToWorkWith)) != null) {
            lastIndexOf = result.index;
            regex.lastIndex = ++nextStop;
        }
        return lastIndexOf;
    }

    function fillTemplate(itemData, template) {
        var invalid = false;


        function repalceEscape() {
            var end, start, val;
            start = template.indexOf('{{{');
            end = template.indexOf('}}}', start + 3);

            if (start > -1 && end > -1) {
                val = langx.trim(template.substring(start + 3, end));
                val = (itemData[val] !== undefined) ? itemData[val] : '';
                template = template.substring(0, start) + val + template.substring(end + 3);
            } else {
                invalid = true;
            }
        }

        function replace() {
            var end, start, val;
            start = template.regexIndexOf(/{{[^{]/);
            end = template.regexIndexOf(/}}[^}]/, start + 2);

            if (start > -1 && end > -1) {
                val = langx.trim(template.substring(start + 2, end));
                val = (itemData[val] !== undefined) ? itemData[val] : '';
                template = template.substring(0, start) + val + template.substring(end + 2);
            } else {
                invalid = true;
            }
        }
        while (!invalid && template.search('{{{') >= 0) {
            repalceEscape(true);
        }

        while (!invalid && template.search(/{{[^{]/) >= 0) {
            replace();
        }
        return template;
    }
    $.fn.repeater.viewTypes.thumbnail = {
        selected: function() {
            var infScroll = this.viewOptions.thumbnail_infiniteScroll;
            var opts;
            if (infScroll) {
                opts = (typeof infScroll === 'object') ? infScroll : {};
                this.infiniteScrolling(true, opts);
            }
        },
        before: function(helpers) {
            var alignment = this.viewOptions.thumbnail_alignment;
            var $cont = this.$canvas.find('.repeater-thumbnail-cont');
            var data = helpers.data;
            var response = {};
            var $empty, validAlignments;

            if ($cont.length < 1) {
                $cont = $('<div class="clearfix repeater-thumbnail-cont" data-container="true" data-infinite="true" data-preserve="shallow"></div>');
                if (alignment && alignment !== 'none') {
                    validAlignments = {
                        'center': 1,
                        'justify': 1,
                        'left': 1,
                        'right': 1
                    };
                    alignment = (validAlignments[alignment]) ? alignment : 'justify';
                    $cont.addClass('align-' + alignment);
                    this.thumbnail_injectSpacers = true;
                } else {
                    this.thumbnail_injectSpacers = false;
                }
                response.item = $cont;
            } else {
                response.action = 'none';
            }

            if (data.items && data.items.length < 1) {
                $empty = $('<div class="empty"></div>');
                $empty.append(this.viewOptions.thumbnail_noItemsHTML);
                $cont.append($empty);
            } else {
                $cont.find('.empty:first').remove();
            }

            return response;
        },
        renderItem: function(helpers) {
            var selectable = this.viewOptions.thumbnail_selectable;
            var selected = 'selected';
            var self = this,
                rowData = helpers.subset[helpers.index];
            var $thumbnail = $(fillTemplate(rowData, this.viewOptions.thumbnail_template));

            $thumbnail.data('item_data', rowData);

            if (this.viewOptions.list_actions) {
                var actionDiv = $("<div>").attr({
                    class: "actions pull-right"
                }).appendTo($thumbnail);
                var ul = $("<ul>").appendTo(actionDiv);
                this.viewOptions.list_actions.items.forEach(function(item) {
                    $('<li class="btn btn-primary btn-sm"></li>').html(item.html).appendTo(ul).on("click", function(e) {
                        item.clickAction({
                            item: $thumbnail,
                            rowData: rowData
                        }, function() {}, e);
                    });
                });
                var target = actionDiv.find("span.published");
                target.attr("class", "");
                if (rowData.published) {
                    target.addClass("glyphicon glyphicon-check published");
                } else {
                    target.addClass("glyphicon glyphicon-unchecked published");
                }
            }
            if (selectable) {
                $thumbnail.addClass('selectable');
                $thumbnail.on('click', function() {
                    if (self.isDisabled) return;

                    if (!$thumbnail.hasClass(selected)) {
                        if (selectable !== 'multi') {
                            self.$canvas.find('.repeater-thumbnail-cont .selectable.selected').each(function() {
                                var $itm = $(this);
                                $itm.removeClass(selected);
                                self.$element.trigger('deselected.fu.repeaterThumbnail', $itm);
                            });
                        }

                        $thumbnail.addClass(selected);
                        self.$element.trigger('selected.fu.repeaterThumbnail', $thumbnail);
                    } else {
                        $thumbnail.removeClass(selected);
                        self.$element.trigger('deselected.fu.repeaterThumbnail', $thumbnail);
                    }
                });
            }

            helpers.container.append($thumbnail);
            if (this.thumbnail_injectSpacers) {
                $thumbnail.after('<span class="spacer">&nbsp;</span>');
            }

            if (this.viewOptions.thumbnail_itemRendered) {
                this.viewOptions.thumbnail_itemRendered({
                    container: helpers.container,
                    item: $thumbnail,
                    itemData: helpers.subset[helpers.index]
                }, function() {});
            }

            return false;
        }
    };

    function dataSource(options, callback) {
        var items = [];
        var addItem = function(item) {
            items.push({
                name: item.name,
                tpl: tplHelper.show(item)
            })
        };
        for (var key in tplHelper.data) {
            var _item = tplHelper.data[key];
            addItem(_item);
        }
        var responseData = {
            count: items.length,
            items: items,
            page: options.pageIndex,
            pages: Math.ceil(items.length / (options.pageSize || 50))
        };
        var firstItem, lastItem;

        firstItem = options.pageIndex * (options.pageSize || 50);
        lastItem = firstItem + (options.pageSize || 50);
        lastItem = (lastItem <= responseData.count) ? lastItem : responseData.count;
        responseData.start = firstItem + 1;
        responseData.end = lastItem;

        //use setTimeout to simulate server response delay. In production, you would not want to do this
        setTimeout(function() {
            callback(responseData);
        }, 1000);
    };
    return spa.RouteController.inherit({
        klassName: "TemplatesController",
        data: null,
        repeaterId: "tplRepeater",
        // preparing: function(e) {
        //     e.result = server().connect("templates", "get", "index").then(function(data) {
        //         self.data = data;
        //     });
        // },

        buildList: function() {
            var self = this;
            var list = new List({
                title: "模板列表",
                id: this.repeaterId,
                key: "templates",
                defaultView: "thumbnail",
                thumbnail_template: langx.trim(__selector.find("#listItem-partial").html()),
                // dataSource: dataSource,
                actions: [{
                        name: "show",
                        title: "查看",
                        clickAction: function(helpers, callback, e) {
                            var rowData = helpers.rowData;
                            var html = langx.trim(rowData.html);
                            var func = new Function("tpl", "data", "container", rowData.javascript);
                            var div = $("<div>");
                            $('<style>' + rowData.css + '</style>').appendTo(div);
                            var _data = JSON.parse(rowData.data);
                            func(hbs.compile(html), _data.buildForm ? _data.demoData || {} : _data, div);
                            modalFunc.show("content", div, "模板预览", {
                                fullModal: true
                            });
                        }
                    }, {
                        name: "发布",
                        html: '<span class="published" title="发布"></span>',
                        title: "发布",
                        clickAction: function(helpers, callback, e) {
                            server().connect("templates", "post", "update", {
                                id: helpers.rowData.id,
                                published: !helpers.rowData.published
                            }).then(function(data) {
                                $("#" + self.repeaterId).repeater("render");
                            });
                        }
                    },
                    {
                        name: "delete",
                        title: "删除",
                        callback: function() {

                        }
                    }, {
                        name: "edit",
                        title: "编辑",
                        tpl: tpl,
                        modalInitEvts: function(_modal, data) {
                            _modal.find('[data-toggle="tab"]').each(function() {
                                var $this = $(this);
                                $this.tab();
                            });

                        },
                        callback: function() {

                        }
                    }
                ],
                columns: [{
                    label: 'name',
                    property: 'name',
                    sortable: false
                }]
            });

            return list;
        },
        rendering: function(e) {
            var list = this.buildList(),
                self = this,
                selector = list.getDom();
            selector.find(".repeater-add button").off("click").on("click", function(e) {
                modalFunc.show("form", $(tpl()), "添加模板", {
                    key: "templates",
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
                    }
                });
            });

            selector.on('selected.fu.repeaterList', function() {

            });
            selector.find(".repeater-refresh button").off("click").on("click", function(e) {
                selector.repeater('render');
            });
            e.content = selector[0];
        },

        entered: function() {},

        exited: function() {}
    });
})