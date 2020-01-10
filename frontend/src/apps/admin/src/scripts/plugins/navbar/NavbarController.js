define([
    "skylark-jquery",
    "commHelpers/Partial",
    "server",
    "handlebars",
    "skylarkjs",
    "skylarkBs",
], function($, partial, server, handlebars, skylarkjs) {
    var spa = skylarkjs.spa,
        __activeIdData = null,
        router = skylarkjs.router;

    window.setActiveRouteIdData = function(data) {
        __activeIdData = data;
    };
    $.fn.repeater.Constructor.prototype.list_createItemActions = function listCreateItemActions() {
        var actionsHtml = '';
        var self = this;
        var i;
        var $table = this.$element.find('.repeater-list .repeater-list-wrapper > table');
        var $actionsTable = this.$canvas.find('.table-actions');
        var len = this.viewOptions.list_actions.items.length;
        if (len == 1) {
            var action = this.viewOptions.list_actions.items[0];
            actionsHtml = '<a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + action.html + '</a>'
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.list_actions_width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function(rowNumber) {
                    var id = $(this).parent().attr("id");
                    var data = $("#" + id).data("item_data")
                    if (self.options.exceptActionRows && data && _.includes(self.options.exceptActionRows, data.name)) {
                        $(this).html("-");
                    } else {
                        $(this).html(actionsHtml);
                    }
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        } else {
            for (i = 0; i < len; i++) {
                var action = this.viewOptions.list_actions.items[i];
                var html = action.html;

                actionsHtml += '<li class="' + action.name + '"><a href="javascript:void(0)" data-action="' + action.name + '" class="action-item"> ' + html + '</a></li>';
            }
            var actionsDropdown = '<ul class="ul-inline list-unstyled ul-horizontally" role="menu">' +
                actionsHtml + '</ul>';
            if ($actionsTable.length < 1) {
                var $actionsColumnWrapper = $('<div class="actions-column-wrapper" style="width: ' + this.list_actions_width + 'px"></div>').insertBefore($table);
                var $actionsColumn = $table.clone().addClass('table-actions');
                $actionsColumn.find('th:not(:last-child)').remove();
                $actionsColumn.find('tr td:not(:last-child)').remove();

                // Dont show actions dropdown in header if not multi select
                if (this.viewOptions.list_selectable === 'multi' || this.viewOptions.list_selectable === 'action') {
                    $actionsColumn.find('thead tr').html('<th><div class="repeater-list-heading">' + actionsDropdown + '</div></th>');

                    if (this.viewOptions.list_selectable !== 'action') {
                        // disable the header dropdown until an item is selected
                        $actionsColumn.find('thead .btn').attr('disabled', 'disabled');
                    }
                } else {
                    var label = this.viewOptions.list_actions.label || '<span class="actions-hidden">a</span>';
                    $actionsColumn.find('thead tr').addClass('empty-heading').html('<th>' + label + '<div class="repeater-list-heading">' + label + '</div></th>');
                }

                // Create Actions dropdown for each cell in actions table
                var $actionsCells = $actionsColumn.find('td');

                $actionsCells.each(function addActionsDropdown(rowNumber) {
                    $(this).html(actionsDropdown).addClass("r-list-action");
                    $(this).find('a').attr('data-row', rowNumber + 1);
                });
            }
        }

        $actionsColumnWrapper.append($actionsColumn);

        this.$canvas.addClass('actions-enabled');
        this.list_sizeActionsTable();

        // row level actions click
        this.$element.find('.table-actions tbody .action-item').on('click', function onBodyActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var row = $(this).data('row');
                var selected = {
                    actionName: actionName,
                    rows: [row]
                };
                self.list_getActionItems(selected, e);
            }
        });
        // bulk actions click
        this.$element.find('.table-actions thead .action-item').on('click', function onHeadActionItemClick(e) {
            if (!self.isDisabled) {
                var actionName = $(this).data('action');
                var selected = {
                    actionName: actionName,
                    rows: []
                };
                var selector = '.repeater-list-wrapper > table .selected';

                if (self.viewOptions.list_selectable === 'action') {
                    selector = '.repeater-list-wrapper > table tr';
                }
                self.$element.find(selector).each(function eachSelector(selectorIndex) {
                    selected.rows.push(selectorIndex + 1);
                });

                self.list_getActionItems(selected, e);
            }
        });
    };

    var currentNav,
        currentSubs = {},

        setActive = function(name) {
            if (currentNav) $(currentNav).removeClass("active");
            currentNav = $("." + name + "-nav");
            if (currentNav) currentNav.addClass("active");
        },
        setSubActive = function(subName, parentName) {
            var sub = currentSubs[parentName];
            if (sub) sub._s.removeClass("active");
            currentSubs[parentName] = {
                _s: $("." + subName + "-nav").addClass("active"),
                name: subName
            };
        },
        showThrob = function() {
            var selector = $("#mainWrapper"),
                throb = window.addThrob(selector[0], function() {

                    router.one("routed", function() {
                        throb.remove();
                        selector.css("opacity", 1);
                    });
                });
        },

        initItems = function(routes, key, ul) {
            var li, page = routes[key];
            if (!page.data) return;
            var name = page.data.name,
                navName = page.data.navName,
                path = page.pathto;
            if (page.for === "admin") return;

            if (page.sub) return;
            if (page.subs && page.subs.length) {
                li = $("<li>").attr({
                    class: name + "-nav subs dropdown"
                }).addContent(
                    $("<a>").attr({
                        class: "nav-item dropdown-toggle"
                    }).data({
                        name: name,
                        isRouter: page.isRouter == false ? false : true,
                        path: path,
                        toggle: "dropdown"
                    }).html(navName + '<b class="caret"></b>').data("toggle", "dropdown")
                ).appendTo(ul);

                var subUl = $("<ul>").attr({
                    class: "list-unstyled dropdown-menu"
                }).appendTo(li);

                (function(_page, _name, _ul) {
                    _page.subs.forEach(function(sub) {
                        var subPage = routes[sub],
                            subData = subPage.data;
                        $("<li>").attr({
                            class: "sub-nav " + subData.name + "-nav"
                        }).addContent(
                            $("<a>").attr({
                                class: "nav-item"
                            }).data({
                                name: subData.name,
                                sub: true,
                                parent: _name,
                                path: subPage.pathto
                            }).html(subData.navName)
                        ).appendTo(_ul);
                    });
                })(page, name, subUl);
            } else {
                li = $("<li>").attr({
                    class: name + "-nav"
                }).addContent(
                    $("<a>").attr({
                        class: "nav-item"
                    }).data({
                        name: name,
                        path: path
                    }).html(navName)
                ).appendTo(ul);
            }
            if (page.hide) li.addClass("hide");
        };


    return spa.PluginController.inherit({
        _currentHideItem: null,
        _currentHideKey: null,
        starting: function(evt) {
            var spa = evt.spa,
                // basePath = (spa.getConfig("baseUrl") || "").replace(/.*(\/$)/, ""),
                routes = spa.getConfig("routes"),
                _el = $("#sk-navbar"),
                self = this,
                goToPath = function(name) {
                    var path = routes[name].pathto;
                    if (router.go(path)) {
                        // 监听routed已经实现
                        // setActive(name);
                        showThrob();
                    }
                };
            var ul = this.ul = $("<ul>").attr({
                class: "nav navbar-nav"
            }).delegate(".nav-item", "click", function(e) {
                var target = $(e.target),
                    data = target.data();
                if (self._currentHideKey && self._currentHideKey != data.name) {
                    self.hideRoute();
                }
                if (data.sub) {
                    goToPath(data.name);
                } else {
                    var sub = currentSubs[data.name];
                    // if (sub) {
                    //     // 跳转到上次打开的二级导航
                    //     goToPath(sub.name);
                    // } else {
                    goToPath(data.name);
                    if (sub) $("." + sub.name + "-nav").removeClass("active");
                    // }
                }
            });
            router.on("routing", function(e) {
                window._goTop();
            });
            router.on("routed", function(e) {
                var curR = e.current.route;
                var idM = curR.pathto.match(/\/(.*)\/:id$/);

                // update nav dom with active class
                if (curR.name.match(/-/)) {
                    // 区分二级导航
                    var names = curR.name.split("-");
                    setActive(names[0]);
                    // addBreadcrumb(curR.name, routes, names[0]);
                    setSubActive(curR.name, names[0]);
                } else if (idM) {
                    // addBreadcrumb(idM[1], routes, idM[1], e.current.params.id);
                    setActive(idM[1]);
                } else {
                    // addBreadcrumb(curR.name, routes);
                    setActive(curR.name || "home");
                }
            });
            $(".logo-nav").on("click", function() {
                goToPath("home");
            });
            [{
                key: "vhtml5",
                href: "/vhtml5",
                name: "页面设计"
            }].forEach(function(item) {
                $("<li>").attr({
                    class: item.key + "-nav"
                }).html("<a class='nav-item' data-spa-router='false' target='_blank' href='" + item.href + "'>" + item.name + "</a>").appendTo(ul);
            });
            for (var key in routes) {
                initItems(routes, key, ul);
            }
            [{
                key: "logout",
                href: "/logout",
                name: "退出"
            }].forEach(function(item) {
                $("<li>").attr({
                    class: item.key + "-nav"
                }).html("<a class='nav-item' data-spa-router='false' href='" + item.href + "'>" + item.name + "</a>").appendTo(ul);
            });
            partial.get("modal-partial");
            var modal = $("<div>").html(handlebars.compile("{{> modal-partial}}")());
            document.body.appendChild(modal[0]);
            $(function() {
                $('[data-toggle="dropdown"]').dropdown();
            });
            _el.html(ul);

        },
        showHidenRoute: function(key) {
            var li = this.ul.find("li." + key + "-nav");
            // if (!notClick) li.find("a").click();
            this._currentHideItem = li.removeClass("hide");
            this._currentHideKey = key;
        },
        hideRoute: function(key) {
            if (this._currentHideItem) this._currentHideItem.addClass("hide");
            this._currentHideItem = null;
            this._currentHideKey = null;
        },
        routed: function() {}
    });
});