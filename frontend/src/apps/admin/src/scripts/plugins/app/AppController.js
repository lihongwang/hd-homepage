define([
    "skylarkjs",
], function(skylarkjs) {
    var spa = skylarkjs.spa,
        noder = skylarkjs.noder,
        langx = skylarkjs.langx,
        router = skylarkjs.router;
    window.__isDelayed = null;
    window.__sitesData = null;

    function update(config, $) {
        if (config.site && config.site.id) {
            var data = config.site;
            $("#logo").attr({
                src: data.src,
                title: data.name,
                alt: data.name
            }).removeClass("hide");
            $("#contact").html(data.contact);
            $("#footerTwo").html(data.footer);
            $("meta[name=keyword]").attr("content", data.keyword);
            $("meta[name=description]").attr("content", data.description);
        }
        $(".footer").removeClass("hide");
    };

    return spa.PluginController.inherit({
        klassName: "AppController",
        _showProcessing: function() {
            if (!this._throbber) {
                this._throbber = noder.throb(document.body);
            }

        },
        _hideProcessing: function() {
            if (this._throbber) {
                this._throbber.remove();
                this._throbber = null;
            }
        },

        preparing: function(e) {
            var deferred = new langx.Deferred();
            window.formatDate = function(d, split) {
                d = d || new Date();
                split = split || "-";
                var padTwo = function(value) {
                        var s = '0' + value;
                        return s.substr(s.length - 2);
                    },
                    date = new Date(d);
                return date.getFullYear() + split + padTwo(date.getMonth() + 1) + split + padTwo(date.getDate());
            };
            window._goTop = function(time) {
                time = time || 200;
                $([document.body, document.documentElement]).animate({
                    "scrollTop": 0
                }, time, function() {
                    goTopShown = false;
                });
                $(".go-top-btn").css({
                    opacity: 0
                }).hide();
            };
            window.addThrob = function(node, callback, opacity) {
                node.style.opacity = opacity === 0 ? 0 : opacity || 0.5;
                var throb = noder.throb(node, {});
                callback();
                return throb;
            };
            var goTop = function(selector) {
                var goTopShown = false;
                selector.css({
                    opacity: 0
                }).on("click", function() {
                    window._goTop();
                });

                $(window).scroll(function() {
                    if (goTopShown && window.scrollY > 0) return;
                    if (window.scrollY > 100) {
                        selector.css({
                            opacity: 1
                        }).show();
                        goTopShown = true;
                    } else {
                        selector.css({
                            opacity: 0
                        }).hide();
                        goTopShown = false;
                    }
                });
            };
            var main = skylarkjs.finder.find("#mainWrapper");
            if (main) {
                throb = window.addThrob(main, function() {
                    require(["skylark-jquery"], function($) {
                        require(["server", "skylarkBs", "material"], function(server) {
                            require(["template"], function(tpl) {
                                window.UMEDITOR_HOME_URL = "/lib/umeditor/";
                                window.etpl = tpl;
                                require(["umeditorConfig"], function(config) {
                                    require(["umeditor"], function(editor) {
                                        require(["umeditorZh"], function() {
                                            $.material.init();
                                            return server().connect("sites", "get", "config").then(function(data) {
                                                window.__sitesData = data;
                                                update(data, $);
                                                main.style.opacity = 1;
                                                throb.remove();
                                                deferred.resolve();
                                            });

                                            goTop($(".go-top-btn"));
                                            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                                                $("#sk-navbar").delegate(".nav-item", "click", function(e) {
                                                    $('#sk-navbar').collapse('hide');
                                                });
                                                $(".logo-nav").on("click", function() {
                                                    $('#sk-navbar').collapse('hide');
                                                })
                                                $(".navbar").addClass("navbar-default");
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
            e.result = deferred.promise;
        },

        starting: function(e) {
            this._showProcessing();
        },
        started: function(e) {
            this._hideProcessing();
        }
    });
});