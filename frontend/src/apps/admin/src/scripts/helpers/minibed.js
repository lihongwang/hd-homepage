define(["jquery", "skylarkjs", "minibed"], function($, skylarkjs, Minibed) {
    var langx = skylarkjs.langx;
    var Embeded = langx.Evented.inherit({
        klass: "Embeded",
        init: function(opts) {
            this.container = opts.container;
        },

        initMinibed: function() {
            new Minibed({
                theme: 'dark',
                editorTheme: 'minibed-dark',
                container: this.container,
                files: {
                    html: ['mini.html', 'bed.html'],
                    js: ['mini.js', 'mini.es6'],
                    css: ['mini.css', 'mini.scss', 'mini.less']
                },
                external: {
                    js: [],
                    css: []
                },
                settings: {
                    readOnly: false, // true, nocursor, false
                    scrollLock: false,
                    lineWrapping: true,
                    lineNumbers: true,
                    tabSize: 2,
                    css: {
                        base: 'none', // normalize, reset
                    }
                },
                notes: [] // array of strings, like footer notes, they are gonna be paragraphs
            }).show();
        },

        start: function() {
            var self = this;
            require([
                "cm",
                "cmjs",
                "cmhtml",
                "cmcss",
                "cmsb"
            ], function() {
                self.initMinibed();
            });
        }
    });
    return Embeded;
});