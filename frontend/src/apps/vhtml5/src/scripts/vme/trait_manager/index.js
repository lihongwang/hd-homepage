define([
    './config/config',
    './model/Traits',
    './view/TraitsView'
], function(defaults, Traits, TraitsView) {
    return function() {
        var c = {};
        var TraitsViewer;

        return {

            TraitsView,

            /**
             * Name of the module
             * @type {String}
             * @private
             */
            name: 'TraitManager',

            /**
             * Get configuration object
             * @return {Object}
             * @private
             */
            getConfig() {
                return c;
            },

            /**
             * Initialize module. Automatically called with a new instance of the editor
             * @param {Object} config Configurations
             */
            init(config) {
                c = config || {};
                for (var name in defaults) {
                    if (!(name in c))
                        c[name] = defaults[name];
                }

                var ppfx = c.pStylePrefix;
                if (ppfx)
                    c.stylePrefix = ppfx + c.stylePrefix;
                TraitsViewer = new TraitsView({
                    collection: [],
                    editor: c.em,
                    config: c,
                });
                return this;
            },

            /**
             *
             * Get Traits viewer
             * @private
             */
            getTraitsViewer() {
                return TraitsViewer;
            },

            /**
             * Add new trait type
             * @param {string} name Type name
             * @param {Object} methods Object representing the trait
             */
            addType(name, trait) {
                var itemView = TraitsViewer.itemView;
                TraitsViewer.itemsView[name] = itemView.extend(trait);
            },

            /**
             * Get trait type
             * @param {string} name Type name
             * @return {Object}
             */
            getType(name) {
                return TraitsViewer.itemsView[name];
            },

        };
    };
});