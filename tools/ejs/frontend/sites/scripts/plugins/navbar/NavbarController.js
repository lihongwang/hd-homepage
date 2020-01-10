define([
    "skylark-jquery",
    "commHelpers/Partial",
    "lodash",
    "server",
    "handlebars",
    "skylarkjs",
    "skylarkBs"
], function($, partial, _, server, handlebars, skylarkjs) {
    var spa = skylarkjs.spa,
        __activeIdData = null,
        router = skylarkjs.router;

    window.setActiveRouteIdData = function(data) {
        __activeIdData = data;
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

        initItems = function(routes, page, ul) {
            if (!page.data) return;
            var name = page.data.name,
                navName = page.data.navName,
                path = page.pathto;
            if (page.subs && page.subs.length) {
                var li = $("<li>").attr({
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
                    var subs = {};
                    _page.subs.forEach(function(sub) {
                        subs[sub] = routes[sub];
                    });
                    _.sortBy(subs, function(s) {
                        return s.position;
                    }).forEach(function(subPage) {
                        var subData = subPage.data;
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
                $("<li>").attr({
                    class: name + "-nav "
                }).addContent(
                    $("<a>").attr({
                        class: "nav-item"
                    }).data({
                        name: name,
                        path: path
                    }).html(navName)
                ).appendTo(ul);
            }
        };


    return spa.PluginController.inherit({

        starting: function(evt) {
            var spa = evt.spa,
                // basePath = (spa.getConfig("baseUrl") || "").replace(/.*(\/$)/, ""),
                routes = spa.getConfig("routes"),
                // routes = window.__sitesData.routes,
                _el = $("#sk-navbar"),
                goToPath = function(name) {
                    var path = routes[name].pathto;
                    if (router.go(path)) {
                        // 监听routed已经实现
                        // setActive(name);
                        showThrob();
                    }
                };
            var ul = $("<ul>").attr({
                class: "nav navbar-nav"
            }).delegate(".nav-item", "click", function(e) {
                var target = $(e.target),
                    data = target.data();
                if (data.sub) {
                    goToPath(data.name);
                } else {
                    var sub = currentSubs[data.name];
                    // if (sub) {
                    // 跳转到上次打开的二级导航
                    // goToPath(sub.name);
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
            _.sortBy(_.filter(routes, function(r) {
                return !r.hide && !r.sub;
            }), function(r) {
                return r.position;
            }).forEach(function(r) {
                initItems(routes, r, ul);
            });
            partial.get("modal-partial");
            var modal = $("<div>").html(handlebars.compile("{{> modal-partial}}")());
            document.body.appendChild(modal[0]);
            _el.html(ul);

        },
        routed: function() {}
    });
});