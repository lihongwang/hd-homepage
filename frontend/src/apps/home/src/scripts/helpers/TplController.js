define([
    "jquery",
    "skylarkjs",
    "handlebars",
    "server",
    "commHelpers/tplHelper",
    "text!scripts/helpers/tpl.hbs"
], function($, skylarkjs, hbs, server, tplHelper, _tplHbs) {
    var spa = skylarkjs.spa,
        langx = skylarkjs.langx,
        selector = $(langx.trim(_tplHbs));

    return spa.RouteController.inherit({
        klassName: "TplController",
        pageData: null,
        pageName: "",
        preparing: function(e) {
            var self = this;
            var action = e.route.pathto.split("/").pop() || e.route.name;
            e.result = server().connect("pages", "get", "show?key=name&value=" + action).then(function(data) {
                self.pageData = data;
            });
        },

        rendering: function(e) {
            var tpl = hbs.compile(langx.trim(selector.find("#main").html()).replace("{{&gt;", "{{>")),
                self = this,
                _ec = $(tpl({}));
            if (this.pageData && this.pageData.contents) {
                self.pageData.contents.forEach(function(content) {
                    var template = content.template;
                    var html = langx.trim(template.html);
                    var func = new Function("tpl", "data", "container", template.javascript);
                    var div = $("<div>").attr({ class: "page-item" }).appendTo(_ec.find(".pages"));
                    $('<style>' + template.css + '</style>').appendTo(div);
                    func(hbs.compile(html), content.sub ? content.sub : JSON.parse(template.data), div);
                });
            }
            e.content = _ec[0];
        },

        rendered: function() {

        },

        entered: function() {
            $(document.body).addClass(this.pageName);
            $(".footer").removeClass("hide");
            window._systemThrob.remove();
        },
        exited: function() {
            $(document.body).removeClass(this.pageName);
        }
    });
});