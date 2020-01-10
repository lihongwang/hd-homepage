define([
    './config/config',
    './model/Page',
    './view/TemplateView'
], function(defaults, Page, PageView) {
    /**
     * Before using methods you should get first the module from the editor instance, in this way:
     *
     * ```js
     * var TemplateManager = editor.TemplateManager;
     * ```
     *
     * @moduleTemplateManager 
     */
    'use strict';

    return function() {
        var c = {};
        var pages, view;
        return {
            name: 'TemplateManager',
            storageKey: 'template',
            init: function init(config) {
                c = config || {};
                // for (var name in defaults) {
                //     if (!(name in c)) c[name] = defaults[name];
                // }

                // devices = new Page(c.page);
                // view = new PageView({
                //     collection: devices,
                //     config: c
                // });
                return this;
            },

            store: function store(noStore) {
                var obj = {};
                var assets = JSON.stringify(this.getAll().toJSON());
                obj[this.storageKey] = assets;
                if (!noStore && c.stm) c.stm.store(obj);
                return obj;
            },


            load: function load() {
                // var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                // var name = this.storageKey;
                // var assets = data[name] || [];

                // if (typeof assets == 'string') {
                //     try {
                //         assets = JSON.parse(data[name]);
                //     } catch (err) {}
                // }

                // if (assets && assets.length) {
                //     this.getAll().reset(assets);
                // }

                // return assets;
            },

            get: function get(name) {
                // return devices.get(name);
            },

            render: function render() {
                return view.render().el;
            }
        };
    };
});