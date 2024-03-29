define([
    'exports',
    'module',
    './config/config',
    './model/Sectors',
    './model/Properties',
    './view/SectorsView'
], function(exports, module, defaults, Sectors, Properties, SectorsView) {
    /**
     * With Style Manager you basically build categories (called sectors) of CSS properties which could
     * be used to custom components and classes.
     * You can init the editor with all sectors and properties via configuration
     *
     * ```js
     * var editor = grapesjs.init({
     *   ...
     *  styleManager: {...} // Check below for the possible properties
     *   ...
     * });
     * ```
     *
     * Before using methods you should get first the module from the editor instance, in this way:
     *
     * ```js
     * var styleManager = editor.StyleManager;
     * ```
     *
     * @module StyleManager
     * @param {Object} config Configurations
     * @param {Array<Object>} [config.sectors=[]] Array of possible sectors
     * @example
     * ...
     * styleManager: {
     *    sectors: [{
     *      id: 'dim',
     *      name: 'Dimension',
     *      properties: [{
     *        name: 'Width',
     *        property: 'width',
     *        type: 'integer',
     *        units: ['px', '%'],
     *        defaults: 'auto',
     *        min: 0,
              }],
     *     }],
     * }
     * ...
     */
    'use strict';

    var _extends = Object.assign || function(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

    module.exports = function() {
        var c = {};
        var properties = undefined;
        var sectors, SectView;

        return {
            /**
             * Name of the module
             * @type {String}
             * @private
             */
            name: 'StyleManager',

            /**
             * Get configuration object
             * @return {Object}
             * @private
             */
            getConfig: function getConfig() {
                return c;
            },

            /**
             * Initialize module. Automatically called with a new instance of the editor
             * @param {Object} config Configurations
             */
            init: function init(config) {
                c = config || {};
                for (var name in defaults) {
                    if (!(name in c)) c[name] = defaults[name];
                }

                var ppfx = c.pStylePrefix;
                if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

                properties = new Properties();
                sectors = new Sectors(c.sectors, c);
                SectView = new SectorsView({
                    collection: sectors,
                    target: c.em,
                    config: c
                });
                return this;
            },

            /**
             * Add new sector to the collection. If the sector with the same id already exists,
             * that one will be returned
             * @param {string} id Sector id
             * @param  {Object} sector  Object representing sector
             * @param  {string} [sector.name='']  Sector's label
             * @param  {Boolean} [sector.open=true] Indicates if the sector should be opened
             * @param  {Array<Object>} [sector.properties=[]] Array of properties
             * @return {Sector} Added Sector
             * @example
             * var sector = styleManager.addSector('mySector',{
             *   name: 'My sector',
             *   open: true,
             *   properties: [{ name: 'My property'}]
             * });
             * */
            addSector: function addSector(id, sector) {
                var result = this.getSector(id);
                if (!result) {
                    sector.id = id;
                    result = sectors.add(sector);
                }
                return result;
            },

            /**
             * Get sector by id
             * @param {string} id  Sector id
             * @return {Sector|null}
             * @example
             * var sector = styleManager.getSector('mySector');
             * */
            getSector: function getSector(id) {
                var res = sectors.where({ id: id });
                return res.length ? res[0] : null;
            },

            /**
             * Remove a sector by id
             * @param  {string} id Sector id
             * @return {Sector} Removed sector
             * @example
             * const removed = styleManager.removeSector('mySector');
             */
            removeSector: function removeSector(id) {
                return this.getSectors().remove(this.getSector(id));
            },

            /**
             * Get all sectors
             * @return {Sectors} Collection of sectors
             * */
            getSectors: function getSectors() {
                return sectors;
            },

            /**
             * Add property to the sector identified by id
             * @param {string} sectorId Sector id
             * @param {Object} property Property object
             * @param {string} [property.name=''] Name of the property
             * @param {string} [property.property=''] CSS property, eg. `min-height`
             * @param {string} [property.type=''] Type of the property: integer | radio | select | color | file | composite | stack
             * @param {Array<string>} [property.units=[]] Unit of measure available, eg. ['px','%','em']. Only for integer type
             * @param {string} [property.unit=''] Default selected unit from `units`. Only for integer type
             * @param {number} [property.min=null] Min possible value. Only for integer type
             * @param {number} [property.max=null] Max possible value. Only for integer type
             * @param {string} [property.defaults=''] Default value
             * @param {string} [property.info=''] Some description
             * @param {string} [property.icon=''] Class name. If exists no text will be displayed
             * @param {Boolean} [property.preview=false] Show layers preview. Only for stack type
             * @param {string} [property.functionName=''] Indicates if value need to be wrapped in some function, for istance `transform: rotate(90deg)`
             * @param {Array<Object>} [property.properties=[]] Nested properties for composite and stack type
             * @param {Array<Object>} [property.layers=[]] Layers for stack properties
             * @param {Array<Object>} [property.list=[]] List of possible options for radio and select types
             * @return {Property|null} Added Property or `null` in case sector doesn't exist
             * @example
             * var property = styleManager.addProperty('mySector',{
             *   name: 'Minimum height',
             *   property: 'min-height',
             *   type: 'select',
             *   defaults: '100px',
             *   list: [{
             *     value: '100px',
             *     name: '100',
             *    },{
             *      value: '200px',
             *      name: '200',
             *    }],
             * });
             */
            addProperty: function addProperty(sectorId, property) {
                var prop = null;
                var sector = this.getSector(sectorId);

                if (sector) prop = sector.get('properties').add(property);

                return prop;
            },

            /**
             * Get property by its CSS name and sector id
             * @param  {string} sectorId Sector id
             * @param  {string} name CSS property name, eg. 'min-height'
             * @return {Property|null}
             * @example
             * var property = styleManager.getProperty('mySector','min-height');
             */
            getProperty: function getProperty(sectorId, name) {
                var prop = null;
                var sector = this.getSector(sectorId);

                if (sector) {
                    prop = sector.get('properties').where({ property: name });
                    prop = prop.length == 1 ? prop[0] : prop;
                }

                return prop;
            },

            /**
             * Remove a property from the sector
             * @param  {string} sectorId Sector id
             * @param  {string} name CSS property name, eg. 'min-height'
             * @return {Property} Removed property
             * @example
             * const property = styleManager.removeProperty('mySector', 'min-height');
             */
            removeProperty: function removeProperty(sectorId, name) {
                var props = this.getProperties(sectorId);
                return props && props.remove(this.getProperty(sectorId, name));
            },

            /**
             * Get properties of the sector
             * @param  {string} sectorId Sector id
             * @return {Properties} Collection of properties
             * @example
             * var properties = styleManager.getProperties('mySector');
             */
            getProperties: function getProperties(sectorId) {
                var props = null;
                var sector = this.getSector(sectorId);

                if (sector) props = sector.get('properties');

                return props;
            },

            /**
             * Get what to style inside Style Manager. If you select the component
             * without classes the entity is the Component itself and all changes will
             * go inside its 'style' property. Otherwise, if the selected component has
             * one or more classes, the function will return the corresponding CSS Rule
             * @param  {Model} model
             * @return {Model}
             */
            getModelToStyle: function getModelToStyle(model) {
                var em = c.em;
                var classes = model.get('classes');
                var id = model.getId();

                if (em) {
                    var config = em.getConfig();
                    var cssC = em.get('CssComposer');
                    var state = !config.devicePreviewMode ? model.get('state') : '';
                    var valid = classes.getStyleable();
                    var hasClasses = valid.length;
                    var opts = { state: state };

                    if (hasClasses) {
                        var deviceW = em.getCurrentMedia();
                        var CssRule = cssC.get(valid, state, deviceW);
                        if (CssRule) return CssRule;
                    } else if (config.avoidInlineStyle) {
                        var rule = cssC.getIdRule(id, opts);
                        return rule ? rule : cssC.setIdRule(id, {}, opts);
                    }
                }

                return model;
            },

            /**
             * Add new property type
             * @param {string} id Type ID
             * @param {Object} definition Definition of the type. Each definition contains
             *                            `model` (business logic), `view` (presentation logic)
             *                            and `isType` function which recognize the type of the
             *                            passed entity
             * addType('my-type', {
             *  model: {},
             *  view: {},
             *  isType: (value) => {
             *    if (value && value.type == 'my-type') {
             *      return value;
             *    }
             *  },
             * })
             */
            addType: function addType(id, definition) {
                properties.addType(id, definition);
            },

            /**
             * Get type
             * @param {string} id Type ID
             * @return {Object} Type definition
             */
            getType: function getType(id) {
                return properties.getType(id);
            },

            /**
             * Get all types
             * @return {Array}
             */
            getTypes: function getTypes() {
                return properties.getTypes();
            },

            /**
             * Create new property from type
             * @param {string} id Type ID
             * @param  {Object} [options={}] Options
             * @param  {Object} [options.model={}] Custom model object
             * @param  {Object} [options.view={}] Custom view object
             * @return {PropertyView}
             * @example
             * const propView = styleManager.createType('integer', {
             *  model: {units: ['px', 'rem']}
             * });
             * propView.render();
             * propView.model.on('change:value', ...);
             * someContainer.appendChild(propView.el);
             */
            createType: function createType(id) {
                var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

                var _ref$model = _ref.model;
                var model = _ref$model === undefined ? {} : _ref$model;
                var _ref$view = _ref.view;
                var view = _ref$view === undefined ? {} : _ref$view;

                var type = this.getType(id);

                if (type) {
                    return new type.view(_extends({
                        model: new type.model(model),
                        config: c
                    }, view));
                }
            },

            /**
             * Render sectors and properties
             * @return  {HTMLElement}
             * */
            render: function render() {
                return SectView.render().el;
            }
        };
    };
});