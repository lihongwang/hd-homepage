// inspired from https://github.com/brutusin/json-forms
define([
    "./utils",
    "./renderers"
], function(utils, renderers) {
    BrutusinForms = utils.BrutusinForms;
    /**
     * BrutusinForms factory method
     * @param {type} schema schema object
     * @returns {BrutusinForms.create.obj|Object|Object.create.obj}
     */
    BrutusinForms.create = function(schema, selectContents) {
        var SCHEMA_ANY = { "type": "any" };
        var obj = new Object();
        if (selectContents) utils.setSelectContents(selectContents);
        var container;
        var error;
        utils.setRoot(schema);
        utils.renameRequiredPropeties(schema); // required v4 (array) -> requiredProperties
        utils.populateSchemaMap("$", schema);

        utils.validateDepencyMapIsAcyclic();

        /**
         * Renders the form inside the the container, with the specified data preloaded
         * @param {type} c container
         * @param {type} data json data
         * @returns {undefined}
         */
        obj.render = function(c, data) {
            container = c;
            utils.setInitialValue(data);
            var form = document.createElement("form");
            form.className = "brutusin-form";
            form.onsubmit = function(event) {
                return false;
            };
            if (container) {
                utils.appendChild(container, form);
            } else {
                utils.appendChild(document.body, form);
            }
            if (error) {
                var errLabel = document.createElement("label");
                var errNode = document.createTextNode(error);
                utils.appendChild(errLabel, errNode);
                errLabel.className = "error-message";
                utils.appendChild(form, errLabel);
            } else {
                utils.render(null, form, "$", null, null);
            }
            if (utils.dependencyMap.hasOwnProperty("$")) {
                utils.onDependencyChanged("$");
            }
            if (BrutusinForms.postRender) {
                BrutusinForms.postRender(obj);
            }
        };

        obj.getRenderingContainer = function() {
            return container;
        };

        obj.validate = function() {
            return utils.validate(container);
        };

        obj.getData = function() {
            function removeEmptiesAndNulls(object, s) {
                if (s === null) {
                    s = SCHEMA_ANY;
                }
                if (s && s.$ref) {
                    s = getDefinition(s.$ref);
                }
                if (object instanceof Array) {
                    if (object.length === 0) {
                        return null;
                    }
                    var clone = new Array();
                    for (var i = 0; i < object.length; i++) {
                        clone[i] = removeEmptiesAndNulls(object[i], s.items);
                    }
                    return clone;
                } else if (object === "") {
                    return null;
                } else if (object instanceof Object) {
                    var clone = new Object();
                    var nonEmpty = false;
                    for (var prop in object) {
                        if (prop.startsWith("$") && prop.endsWith("$")) {
                            continue;
                        }
                        var ss = null;
                        if (s.hasOwnProperty("properties") && s.properties.hasOwnProperty(prop)) {
                            ss = s.properties[prop];
                        }
                        if (ss === null && s.hasOwnProperty("additionalProperties")) {
                            if (typeof s.additionalProperties === 'object') {
                                ss = s.additionalProperties;
                            }
                        }
                        if (ss === null && s.hasOwnProperty("patternProperties")) {
                            for (var p in s.patternProperties) {
                                var r = RegExp(p);
                                if (prop.search(r) !== -1) {
                                    ss = s.patternProperties[p];
                                    break;
                                }
                            }
                        }
                        var value = removeEmptiesAndNulls(object[prop], ss);
                        if (value !== null) {
                            clone[prop] = value;
                            nonEmpty = true;
                        }
                    }
                    if (nonEmpty || s.required) {
                        return clone;
                    } else {
                        return null;
                    }
                } else {
                    return object;
                }
            }
            if (!container) {
                return null;
            } else {
                return removeEmptiesAndNulls(utils.getData(), schema);
            }
        };
        BrutusinForms.instances[BrutusinForms.instances.length] = obj;
        utils.setFormId(BrutusinForms.instances.length);
        return obj;

    };
    return BrutusinForms;
});