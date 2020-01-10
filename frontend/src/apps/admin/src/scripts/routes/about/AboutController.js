define([
    "skylark-jquery",
    "skylarkjs",
    "handlebars",
    "server",
    "text!scripts/routes/about/about.hbs"
], function($, skylarkjs, hbs, server, template) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx;
    return spa.RouteController.inherit({
        klassName: "AboutController",

        rendering: function(e) {
            var selector = $(langx.trim(template));
            var tpl = hbs.compile(langx.trim(selector.find("#index-partial").html()).replace("{{&gt;", "{{>"));
            e.content = $(tpl({
                
            }))[0];
        },

        entered: function() {
        },

        exited: function() {
        }
    });
});
