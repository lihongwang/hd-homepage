define([
    "jquery",
    "skylarkjs",
    "handlebars",
    "server",
    "text!scripts/routes/templates/templates.hbs"
], function($, skylarkjs, hbs, server, template) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx;
    return spa.RouteController.inherit({
        klassName: "TemplatesShowController",
        data: null,
        preparing: function(e) {
            var self = this,
                id = e.route.getNamedValue()[1];
            if (id) {
                e.result = server().connect("templates", "get", "show?id=" + id).then(function(data) {
                    self.data = data;
                });
            } else {
                window.go("/templates", true);
            }
        },
        rendering: function(e) {
            var selector = $(langx.trim(template));
            var tpl = hbs.compile(langx.trim(selector.find("#show-partial").html()).replace("{{&gt;", "{{>"));

            e.content = $(tpl({
                id: this.data.id,
            }));
        },

        rendered: function() {

        },

        entered: function() {

        },
        exited: function() {
            
        }
    });
});