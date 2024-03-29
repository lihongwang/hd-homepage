define([
    "skylark-jquery",
    "skylarkjs",
    "skylarkBs",
    "./Partial",
    "server",
    "handlebars"
], function($, skylarkjs, skylarkBs, partial, server, hbs) {
    var langx = skylarkjs.langx;

    function formatDate(d, split) {
        split = split || "-";
        var padTwo = function(value) {
                var s = '0' + value;
                return s.substr(s.length - 2);
            },
            date = new Date(d);
        return date.getFullYear() + split + padTwo(date.getMonth() + 1) + split + padTwo(date.getDate());
    }

    function customRowRenderer(helpers, callback) {
        // let's get the id and add it to the "tr" DOM element
        var item = helpers.item;
        item.attr('id', 'row' + helpers.rowData.id);

        callback();
    }

    function customColumnRenderer(helpers, callback) {
        // Determine what column is being rendered and review
        // http://getfuelux.com/extensions.html#bundled-extensions-list-options
        // for more information on the helpers object.
        var column = helpers.columnAttr;

        // get all the data for the entire row
        var rowData = helpers.rowData;
        var customMarkup = '';

        // Only override the output for specific columns.
        // This will default to output the text value of the row item
        // Determines markup for each column!
        switch (column) {
            // case 'name':
            //     // let's combine name and description into a single column
            //     customMarkup = '<a href="#">' + rowData.name + '</a><div class="small text-muted">' + '</div>';
            //     break;
            case "published":
                customMarkup = rowData.published ? "是" : "否";
                break;
            case 'publishedDate':
                customMarkup = formatDate(rowData.publishedDate);
                break;
            case 'createdAt':
                customMarkup = formatDate(rowData.createdAt);
                break;
            case 'updatedAt':
                customMarkup = formatDate(rowData.updatedAt);
                break;
            case 'src':
                customMarkup = '<img src="' + rowData.src + '">';
                break;

            default:
                // otherwise, just use the existing text value
                customMarkup = helpers.item.text();
                break;
        }

        helpers.item.html(customMarkup);

        callback();
    }
    var defaultActions = {
        "delete": function(modal, opts) {
            return {
                name: 'delete',
                html: '<span class="glyphicon glyphicon-trash" title="删除"></span>',
                clickAction: opts.clickAction ? opts.clickAction : function(helpers, callback, e) {
                    modal.show("delete", "", opts.title, {
                        id: helpers.rowData.id,
                        key: opts.key,
                        callback: function() {
                            opts.container.repeater('render');
                            if (opts.callback) opts.callback();
                        }
                    });
                }
            };
        },
        "edit": function(modal, opts) {
            return {
                name: 'edit',
                html: '<span class="glyphicon glyphicon-edit" title="编辑"></span>',
                clickAction: opts.clickAction ? opts.clickAction : function(helpers, callback, e) {
                    opts.tplOpts = opts.tplOpts || {};
                    var _data = langx.mixin(langx.clone(helpers.rowData), opts.tplOpts);
                    if (_data.publishedDate) _data.publishedDate = formatDate(_data.publishedDate);
                    modal.show("form", $(opts.tpl(_data)), opts.title, {
                        key: opts.key,
                        file: true,
                        beforeSave: function() {
                            if (opts.beforeSave) opts.beforeSave();
                        },
                        modalInitEvts: function(_modal) {
                            if (opts.modalInitEvts) opts.modalInitEvts(_modal, _data);
                        },
                        afterSave: function() {
                            opts.container.repeater('render');
                            if (opts.callback) opts.callback();
                        }
                    });
                }
            };
        },
        "show": function(modal, opts) {
            return {
                name: 'show',
                html: '<span class="glyphicon glyphicon-eye-open" title="查看"></span>',
                clickAction: opts.clickAction ? opts.clickAction : function(helpers, callback, e) {
                    modal.show("content", $(opts.tpl(helpers.rowData)), opts.title, {
                        key: opts.key,
                        callback: function() {
                            opts.container.repeater('render');
                            if (opts.callback) opts.callback();
                        }
                    });
                }
            };
        }
    };
    var List = langx.Evented.inherit({
        klass: "List",
        init: function(opts) {

            var tpl = hbs.compile("{{> repeater-tpl-partial}}"),
                selector = this.selector = $(tpl({
                    itemsPerPage: [
                        { value: 9, text: 9 },
                        { value: 18, text: 18, selected: true },
                        { value: 27, text: 27 },
                        { value: 54, text: 54 },
                        { value: 90, text: 90 }
                    ],
                    listSelectable: opts.listSelectable === false ? false : true,
                    filters: [
                        { value: 'all', text: 'All', selected: true },
                        { value: 'some', text: 'Some' },
                        { value: 'others', text: 'Others' }
                    ],
                    filtersAlt: [
                        { value: 'bug', text: 'Bug' },
                        { value: 'dark', text: 'Dark' },
                        { value: 'dragon', text: 'Dragon' },
                        { value: 'electric', text: 'Electric' },
                        { value: 'fairy', text: 'Fairy' },
                        { value: 'fighting', text: 'Fighting' },
                        { value: 'fire', text: 'Fire' },
                        { value: 'flying', text: 'Flying' },
                        { value: 'ghost', text: 'Ghost' },
                        { value: 'grass', text: 'Grass' },
                        { value: 'ground', text: 'Ground' },
                        { value: 'ice', text: 'Ice' },
                        { value: 'normal', text: 'Normal' },
                        { value: 'poison', text: 'Poison' },
                        { value: 'psychic', text: 'Psychic' },
                        { value: 'rock', text: 'Rock' },
                        { value: 'steel', text: 'Steel' },
                        { value: 'water', text: 'Water' }
                    ],
                    addBtn: opts.addBtn === false ? false : true,
                    refreshBtn: opts.refreshBtn === false ? false : true,
                    title: opts.title,
                    searchAble: opts.searchAble == false ? false : true,
                    needHeader: opts.needHeader == false ? false : true,
                    multiView: opts.multiView === true ? true : false,
                    listShow: opts.listShow === false ? false : true,
                    thumbShow: opts.thumbShow === false ? false : true,
                    id: opts.id
                }));
            this.buildList(selector, opts);
        },

        getDom: function() {
            return this.selector;
        },

        initDataSource: function(opts) {
            return function(options, callback) {
                var pageIndex = options.pageIndex;
                var pageSize = options.pageSize;
                var options = {
                    limit: pageSize,
                    direction: options.sortDirection,
                    sort: options.sortProperty,
                    filter: options.filter.value || '',
                    search: options.search || ''
                };
                var action, actionName = opts.actionName || "index";
                if (actionName.match(/\?/)) {
                    action = actionName + "&page=" + (pageIndex + 1);
                } else {
                    action = actionName + "?page=" + (pageIndex + 1);
                }
                for (var key in options) {
                    if (options[key]) action = action + "&" + key + "=" + options[key];
                }

                if (opts.search) action = action + "&search=" + opts.search;

                server().connect(opts.key, "get", action).then(function(data) {
                    var items = data.rows || [];
                    var totalItems = data.total;
                    var totalPosts = Math.ceil(totalItems / pageSize);
                    var startIndex = (pageIndex * pageSize) + 1;
                    var endIndex = (startIndex + pageSize) - 1;

                    if (endIndex > items.length) {
                        endIndex = items.length;
                    }

                    // configure datasource
                    var dataSource = {
                        page: pageIndex,
                        pages: totalPosts,
                        count: totalItems,
                        start: startIndex,
                        end: endIndex,
                        columns: opts.columns,
                        items: items
                    };

                    // invoke callback to render repeater
                    callback(dataSource);
                });
            };
        },

        buildList: function(container, opts) {
            var obj = {
                list_rowRendered: customRowRenderer,
                list_columnRendered: customColumnRenderer
            };
            if (opts.dataSource) {
                obj.dataSource = opts.dataSource;
            } else {
                obj.dataSource = this.initDataSource(opts);
            }
            obj.dropPagingCap = 9;
            obj.exceptActionRows = opts.exceptActionRows || {};
            obj.defaultView = opts.defaultView || "list";
            if (opts.views) obj.views = opts.views;
            if (opts.thumbnail_selectable) obj.thumbnail_selectable = opts.thumbnail_selectable;
            if (opts.thumbnail_template) obj.thumbnail_template = opts.thumbnail_template;
            if (opts.list_selectable) obj.list_selectable = opts.list_selectable;
            if (opts.actions) {
                require(["scripts/helpers/modal"], function(modal) {
                    var actions = [];
                    opts.actions.forEach(function(a) {
                        if (defaultActions[a.name]) {
                            var aOpts = langx.mixin({ container: container, key: opts.key }, a);
                            actions.push(defaultActions[a.name](modal, aOpts));
                        } else {
                            actions.push(a);
                        }
                    });
                    obj.list_actions = {
                        width: actions.length * 37,
                        items: actions
                    };
                    container.repeater(obj);
                });


            } else {
                container.repeater(obj);
            }
            // container.repeater('infinitescrolling', true, { hybrid: true });
        }
    });
    return List;
});