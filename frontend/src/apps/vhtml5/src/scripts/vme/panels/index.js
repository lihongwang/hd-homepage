/**
 *
 * * [addPanel](#addpanel)
 * * [addButton](#addbutton)
 * * [getButton](#getbutton)
 * * [getPanel](#getpanel)
 * * [getPanels](#getpanels)
 * * [render](#render)
 *
 * This module manages panels and buttons inside the editor.
 * You can init the editor with all panels and buttons necessary via configuration
 *
 * ```js
 * var editor = grapesjs.init({
 *   ...
 *  panels: {...} // Check below for the possible properties
 *   ...
 * });
 * ```
 *
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var panelManager = editor.Panels;
 * ```
 *
 * @module Panels
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.defaults=[]] Array of possible panels
 * @example
 * ...
 * panels: {
 *    defaults: [{
 *      id: 'main-toolbar',
 *      buttons: [{
 *        id: 'btn-id',
 *        className: 'some',
 *        attributes: {
 *          title: 'MyTitle'
 *        }
 *      }],
 *     }],
 * }
 * ...
 */
define([
    './config/config',
    './model/Panel',
    './model/Panels',
    './view/PanelView',
    './view/PanelsView'
], function(defaults, Panel, Panels, PanelView, PanelsView) {

    return function() {
        var c = {};
        var panels, PanelsViewObj;

        return {

            /**
             * Name of the module
             * @type {String}
             * @private
             */
            name: 'Panels',

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

                panels = new Panels(c.defaults);
                PanelsViewObj = new PanelsView({
                    collection: panels,
                    config: c,
                });
                return this;
            },

            /**
             * Returns the collection of panels
             * @return {Collection} Collection of panel
             */
            getPanels() {
                return panels;
            },

            /**
             * Returns panels element
             * @return {HTMLElement}
             */
            getPanelsEl() {
                return PanelsViewObj.el;
            },

            /**
             * Add new panel to the collection
             * @param {Object|Panel} panel Object with right properties or an instance of Panel
             * @return {Panel} Added panel. Useful in case passed argument was an Object
             * @example
             * var newPanel = panelManager.addPanel({
             *   id: 'myNewPanel',
             *  visible  : true,
             *  buttons  : [...],
             * });
             */
            addPanel(panel) {
                return panels.add(panel);
            },

            /**
             * Get panel by ID
             * @param  {string} id Id string
             * @return {Panel|null}
             * @example
             * var myPanel = panelManager.getPanel('myNewPanel');
             */
            getPanel(id) {
                var res = panels.where({
                    id
                });
                return res.length ? res[0] : null;
            },

            /**
             * Add button to the panel
             * @param {string} panelId Panel's ID
             * @param {Object|Button} button Button object or instance of Button
             * @return {Button|null} Added button. Useful in case passed button was an Object
             * @example
             * var newButton = panelManager.addButton('myNewPanel',{
             *   id: 'myNewButton',
             *   className: 'someClass',
             *   command: 'someCommand',
             *   attributes: { title: 'Some title'},
             *   active: false,
             * });
             * // It's also possible to pass the command as an object
             * // with .run and .stop methods
             * ...
             * command: {
             *   run: function(editor) {
             *     ...
             *   },
             *   stop: function(editor) {
             *     ...
             *   }
             * },
             * // Or simply like a function which will be evaluated as a single .run command
             * ...
             * command: function(editor) {
             *   ...
             * }
             */
            addButton(panelId, button) {
                var pn = this.getPanel(panelId);
                return pn ? pn.get('buttons').add(button) : null;
            },

            /**
             * Get button from the panel
             * @param {string} panelId Panel's ID
             * @param {string} id Button's ID
             * @return {Button|null}
             * @example
             * var button = panelManager.getButton('myPanel','myButton');
             */
            getButton(panelId, id) {
                var pn = this.getPanel(panelId);
                if (pn) {
                    var res = pn.get('buttons').where({
                        id
                    });
                    return res.length ? res[0] : null;
                }
                return null;
            },

            /**
             * Render panels and buttons
             * @return {HTMLElement}
             */
            render() {
                return PanelsViewObj.render().el;
            },

            /**
             * Active activable buttons
             * @private
             */
            active() {
                this.getPanels().each(p => {
                    p.get('buttons').each(btn => {
                        if (btn.get('active'))
                            btn.trigger('updateActive');
                    });
                });
            },

            Panel,

        };
    };
});