define([
    "skylark-jquery",
    "skylarkjs",
    "handlebars",
    "server",
    "toastr",
    "commHelpers/Partial",
    "scripts/helpers/modal",
    "handlebars",
    "text!scripts/routes/home/home.hbs"
], function($, skylarkjs, hbs, server, toastr, partial, modalFunc, hbs, homeTpl) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        __file = null;
    return spa.RouteController.inherit({
        klassName: "HomeController",
        site: null,
        preparing: function(e) {
            var self = this;
            e.result = server().connect("sites", "get", "config").then(function(data) {
                self.site = data.site || {};
                self.site.snippets = data.snippets || [];
            });
        },
        rendering: function(e) {
            var selector = $(langx.trim(homeTpl));
            var tpl = hbs.compile(langx.trim(selector.find("#home-manage-partial").html()).replace("{{&gt;", "{{>"));
            var ec = $(tpl(this.site));
            e.content = ec[0];
            ec.find(".form input.file").on("change", function(e) {
                __file = this.files[0];
            });

            ec.find("button.save-btn").off("click").on("click", function() {
                modalFunc.save("sites", ec, {
                    _file: __file
                }, function(data) {
                    __file = null;
                    if (data) {
                        var site = data.site;
                        ec.find(".logo-result").empty().html('<img class="col-sm-5 col-sm-5 col-xs-12" src="' + site.src + '" />');
                        toastr.success("已保存！");
                    }
                });
            });
        },

        entered: function() {},
        exited: function() {}
    });
});