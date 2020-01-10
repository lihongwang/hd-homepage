define([], function() {
    (function exts() {
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(searchString, position) {
                position = position || 0;
                return this.indexOf(searchString, position) === position;
            };
        }
        if (!String.prototype.endsWith) {
            String.prototype.endsWith = function(searchString, position) {
                var subjectString = this.toString();
                if (position === undefined || position > subjectString.length) {
                    position = subjectString.length;
                }
                position -= searchString.length;
                var lastIndex = subjectString.indexOf(searchString, position);
                return lastIndex !== -1 && lastIndex === position;
            };
        }
        if (!String.prototype.includes) {
            String.prototype.includes = function() {
                'use strict';
                return String.prototype.indexOf.apply(this, arguments) !== -1;
            };
        }
        if (!String.prototype.format) {
            String.prototype.format = function() {
                var formatted = this;
                for (var i = 0; i < arguments.length; i++) {
                    var regexp = new RegExp('\\{' + i + '\\}', 'gi');
                    formatted = formatted.replace(regexp, arguments[i]);
                }
                return formatted;
            };
        }
    })();
    var _selectContents;
    var SCHEMA_ANY = { "type": "any" };
    var data;
    var error;
    var initialValue;
    var inputCounter = 0;
    var formId;
    var renderers;
    var root;

    var schemaMap = new Object();
    var dependencyMap = new Object();
    var renderInfoMap = new Object();

    var BrutusinForms = new Object();
    /**
     * Callback functions to be notified after an HTML element has been rendered (passed as parameter).
     * @type type
     */
    BrutusinForms.decorators = new Array();

    BrutusinForms.addDecorator = function(f) {
        BrutusinForms.decorators[BrutusinForms.decorators.length] = f;
    };

    BrutusinForms.onResolutionStarted = function(element) {};

    BrutusinForms.onResolutionFinished = function(element) {};

    BrutusinForms.onValidationError = function(element, message) {
        element.focus();
        if (!element.className.includes(" error")) {
            element.className += " error";
        }
        alert(message);
    };

    BrutusinForms.onValidationSuccess = function(element) {
        element.className = element.className.replace(" error", "");
    };

    /**
     * Callback function to be notified after a form has been rendered (passed as parameter).
     * @type type
     */
    BrutusinForms.postRender = null;
    /**
     * BrutusinForms instances created in the document
     * @type Array
     */
    BrutusinForms.instances = new Array();

    function validateDepencyMapIsAcyclic() {
        function dfs(visitInfo, stack, id) {
            if (stack.hasOwnProperty(id)) {
                error = "Schema dependency graph has cycles";
                return;
            }
            stack[id] = null;
            if (visitInfo.hasOwnProperty(id)) {
                return;
            }
            visitInfo[id] = null;
            var arr = dependencyMap[id];
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    dfs(visitInfo, stack, arr[i]);
                }
            }
            delete stack[id];
        }
        var visitInfo = new Object();
        for (var id in dependencyMap) {
            if (visitInfo.hasOwnProperty(id)) {
                continue;
            }
            dfs(visitInfo, new Object(), id);
        }
    }

    function appendChild(parent, child, schema) {
        parent.appendChild(child);
        for (var i = 0; i < BrutusinForms.decorators.length; i++) {
            BrutusinForms.decorators[i](child, schema);
        }
    }

    function createPseudoSchema(schema) {
        var pseudoSchema = new Object();
        _addContentProp(schema);
        for (var p in schema) {
            if (p === "items" || p === "properties" || p === "additionalProperties") {
                continue;
            }
            if (p === "pattern") {
                pseudoSchema[p] = new RegExp(schema[p]);
            } else {
                pseudoSchema[p] = schema[p];
            }

        }
        return pseudoSchema;
    }

    function getDefinition(path) {
        var parts = path.split('/');
        var def = root;
        for (var p in parts) {
            if (p === "0")
                continue;
            def = def[parts[p]];

        }
        return def;
    }

    function containsStr(array, string) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == string) {
                return true;
            }
        }
        return false;
    }

    function renameRequiredPropeties(schema) {
        if (!schema) {
            return;
        } else if (schema.hasOwnProperty("oneOf")) {
            for (var i in schema.oneOf) {
                renameRequiredPropeties(schema.oneOf[i]);
            }
        } else if (schema.hasOwnProperty("$ref")) {
            var newSchema = getDefinition(schema["$ref"]);
            renameRequiredPropeties(newSchema);
        } else if (schema.type === "object") {
            if (schema.properties) {
                if (schema.hasOwnProperty("required")) {
                    if (Array.isArray(schema.required)) {
                        schema.requiredProperties = schema.required;
                        delete schema.required;
                    }
                }
                for (var prop in schema.properties) {
                    renameRequiredPropeties(schema.properties[prop]);
                }
            }
            if (schema.patternProperties) {
                for (var pat in schema.patternProperties) {
                    var s = schema.patternProperties[pat];
                    if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") || s.hasOwnProperty("oneOf")) {
                        renameRequiredPropeties(schema.patternProperties[pat]);
                    }
                }
            }
            if (schema.additionalProperties) {
                if (schema.additionalProperties.hasOwnProperty("type") || schema.additionalProperties.hasOwnProperty("oneOf")) {
                    renameRequiredPropeties(schema.additionalProperties);

                }
            }
        } else if (schema.type === "array") {
            renameRequiredPropeties(schema.items);
        }
    }

    function populateSchemaMap(name, schema) {
        var pseudoSchema = createPseudoSchema(schema);
        pseudoSchema["$id"] = name;
        schemaMap[name] = pseudoSchema;

        if (!schema) {
            return;
        } else if (schema.hasOwnProperty("oneOf")) {
            pseudoSchema.oneOf = new Array();
            pseudoSchema.type = "oneOf";
            for (var i in schema.oneOf) {
                var childProp = name + "." + i;
                pseudoSchema.oneOf[i] = childProp;
                populateSchemaMap(childProp, schema.oneOf[i]);
            }
        } else if (schema.hasOwnProperty("$ref")) {
            var refSchema = getDefinition(schema["$ref"]);
            if (refSchema) {
                if (schema.hasOwnProperty("title") || schema.hasOwnProperty("description")) {
                    var clonedRefSchema = {};
                    for (var prop in refSchema) {
                        clonedRefSchema[prop] = refSchema[prop];
                    }
                    if (schema.hasOwnProperty("title")) {
                        clonedRefSchema.title = schema.title;
                    }
                    if (schema.hasOwnProperty("description")) {
                        clonedRefSchema.description = schema.description;
                    }
                    refSchema = clonedRefSchema;
                }
                populateSchemaMap(name, refSchema);
            }
        } else if (schema.type === "object") {
            if (schema.properties) {
                pseudoSchema.properties = new Object();
                for (var prop in schema.properties) {
                    var childProp = name + "." + prop;
                    pseudoSchema.properties[prop] = childProp;
                    var subSchema = schema.properties[prop];
                    if (schema.requiredProperties) {
                        if (containsStr(schema.requiredProperties, prop)) {
                            subSchema.required = true;
                        } else {
                            subSchema.required = false;
                        }
                    }
                    populateSchemaMap(childProp, subSchema);
                }
            }
            if (schema.patternProperties) {
                pseudoSchema.patternProperties = new Object();
                for (var pat in schema.patternProperties) {
                    var patChildProp = name + "[" + pat + "]";
                    pseudoSchema.patternProperties[pat] = patChildProp;
                    var s = schema.patternProperties[pat];

                    if (s.hasOwnProperty("type") || s.hasOwnProperty("$ref") ||
                        s.hasOwnProperty("oneOf")) {
                        populateSchemaMap(patChildProp, schema.patternProperties[pat]);
                    } else {
                        populateSchemaMap(patChildProp, SCHEMA_ANY);
                    }
                }
            }
            if (schema.additionalProperties) {
                var childProp = name + "[*]";
                pseudoSchema.additionalProperties = childProp;
                if (schema.additionalProperties.hasOwnProperty("type") ||
                    schema.additionalProperties.hasOwnProperty("oneOf")) {
                    populateSchemaMap(childProp, schema.additionalProperties);
                } else {
                    populateSchemaMap(childProp, SCHEMA_ANY);
                }
            }
        } else if (schema.type === "array") {
            pseudoSchema.items = name + "[#]";
            populateSchemaMap(pseudoSchema.items, schema.items);
        }
        if (schema.hasOwnProperty("dependsOn")) {
            if (schema.dependsOn === null) {
                schema.dependsOn = ["$"];
            }
            var arr = new Array();
            for (var i = 0; i < schema.dependsOn.length; i++) {
                if (!schema.dependsOn[i]) {
                    arr[i] = "$";
                    // Relative cases
                } else if (schema.dependsOn[i].startsWith("$")) {
                    arr[i] = schema.dependsOn[i];
                    // Relative cases
                } else if (name.endsWith("]")) {
                    arr[i] = name + "." + schema.dependsOn[i];
                } else {
                    arr[i] = name.substring(0, name.lastIndexOf(".")) + "." + schema.dependsOn[i];
                }
            }
            schemaMap[name].dependsOn = arr;
            for (var i = 0; i < arr.length; i++) {
                var entry = dependencyMap[arr[i]];
                if (!entry) {
                    entry = new Array();
                    dependencyMap[arr[i]] = entry;
                }
                entry[entry.length] = name;
            }
        }
    }

    function renderTitle(container, title, schema) {
        if (container) {
            if (title) {
                var titleLabel = document.createElement("label");
                if (schema.type !== "any" && schema.type !== "object" && schema.type !== "array") {
                    titleLabel.htmlFor = getInputId();
                }
                var titleNode = document.createTextNode(title + ":");
                appendChild(titleLabel, titleNode, schema);
                if (schema.description) {
                    titleLabel.title = schema.description;
                }
                if (schema.required) {
                    var sup = document.createElement("sup");
                    appendChild(sup, document.createTextNode("*"), schema);
                    appendChild(titleLabel, sup, schema);
                    titleLabel.className = "required";
                }
                appendChild(container, titleLabel, schema);
            }
        }
    }

    function getInputId() {
        return formId + "_" + inputCounter;
    }

    function validate(element) {
        var ret = true;
        if (element.hasOwnProperty("getValidationError")) {
            var error = element.getValidationError();
            if (error) {
                BrutusinForms.onValidationError(element, error);
                ret = false;
            } else {
                BrutusinForms.onValidationSuccess(element);
            }
        }
        if (element.childNodes) {
            for (var i = 0; i < element.childNodes.length; i++) {
                if (!validate(element.childNodes[i])) {
                    ret = false;
                }
            }
        }
        return ret;
    }

    function clear(container) {
        if (container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }
    }

    function render(titleContainer, container, id, parentObject, propertyProvider, value) {
        //console.log(id);
        var schemaId = getSchemaId(id);
        var s = getSchema(schemaId);
        renderInfoMap[schemaId] = new Object();
        renderInfoMap[schemaId].titleContainer = titleContainer;
        renderInfoMap[schemaId].container = container;
        renderInfoMap[schemaId].parentObject = parentObject;
        renderInfoMap[schemaId].propertyProvider = propertyProvider;
        renderInfoMap[schemaId].value = value;
        clear(titleContainer);
        clear(container);
        //console.log(id,s,value);
        var r = renderers[s.type];
        if (r && !s.dependsOn) {
            if (s.title) {
                renderTitle(titleContainer, s.title, s);
            } else if (propertyProvider) {
                renderTitle(titleContainer, propertyProvider.getValue(), s);
            }
            if (!value) {
                if (typeof initialValue !== "undefined" && initialValue !== null) {
                    value = getInitialValue(id);
                } else {
                    value = s.default;
                }
            }
            r(container, id, parentObject, propertyProvider, value);
        } else if (s.$ref) {
            if (obj.schemaResolver) {
                var cb = function(schemas) {
                    if (schemas && schemas.hasOwnProperty(id)) {
                        if (JSON.stringify(schemaMap[id]) !== JSON.stringify(schemas[id])) {
                            cleanSchemaMap(id);
                            cleanData(id);
                            populateSchemaMap(id, schemas[id]);
                            var renderInfo = renderInfoMap[id];
                            if (renderInfo) {
                                render(renderInfo.titleContainer, renderInfo.container, id, renderInfo.parentObject, renderInfo.propertyProvider, renderInfo.value);
                            }
                        }
                    }
                    BrutusinForms.onResolutionFinished(parentObject);
                };
                BrutusinForms.onResolutionStarted(parentObject);
                obj.schemaResolver([id], obj.getData(), cb);
            }
        } else {
            var iContent;
            if (value.src) {
                iContent = document.createElement("img");
                iContent.src = value.src;
                iContent.className = "mini-img result-ic"
            } else {
                iContent = document.createElement("span");
                iContent.className = "result-ic";
                iContent.innerText = value.title || value.name || "";
            }
            container.appendChild(iContent);
        }
    }

    /**
     * Used in object additionalProperties and arrays
     * @param {type} getValue
     * @param {type} onchange
     * @returns {Object.create.createPropertyProvider.ret}
     */
    function createPropertyProvider(getValue, onchange) {
        var ret = new Object();
        ret.getValue = getValue;
        ret.onchange = onchange;
        return ret;
    }

    function getInitialValue(id) {
        var ret;
        try {
            eval("ret = initialValue" + id.substring(1));
        } catch (e) {
            ret = null;
        }
        return ret;
    }

    function getValue(schema, input) {
        if (typeof input.getValue === "function") {
            return input.getValue();
        }
        var value;

        if (input.tagName.toLowerCase() === "select") {
            value = input.options[input.selectedIndex].value;
        } else {
            value = input.value;
        }
        if (value === "") {
            return null;
        }
        if (schema.type === "integer") {
            value = parseInt(value);
            if (!isFinite(value)) {
                value = null;
            }
        } else if (schema.type === "number") {
            value = parseFloat(value);
            if (!isFinite(value)) {
                value = null;
            }
        } else if (schema.type === "boolean") {
            if (input.tagName.toLowerCase() === "input") {
                value = input.checked;
                if (!value) {
                    value = false;
                }
            } else if (input.tagName.toLowerCase() === "select") {
                if (input.value === "true") {
                    value = true;
                } else if (input.value === "false") {
                    value = false;
                } else {
                    value = null;
                }
            }
        } else if (schema.type === "any") {
            if (value) {
                eval("value=" + value);
            }
        }
        return value;
    }

    function getSchemaId(id) {
        return id.replace(/\["[^"]*"\]/g, "[*]").replace(/\[\d*\]/g, "[#]");
    }

    function getParentSchemaId(id) {
        return id.substring(0, id.lastIndexOf("."));
    }

    function _addContentProp(s) {
        // add by LHW
        if (s && s._contentSelect && s.properties) {
            s.properties.contentType = {
                "type": "string",
                "title": "content",
                "_csOption": true,
                "enum": _selectContents || [],
                "className": "contentSelect",
                "description": "content"
            };
            s.properties.contents = {
                "type": "array",
                "className": "list-contents",
                "_innerContent": true,
                "description": "list of content",
                "items": {
                    "additionalProperties": true
                }
            }

        }
    }

    function getSchema(schemaId) {
        var schema = schemaMap[schemaId];
        // _addContentProp(schema, schemaId);
        return schema;
    }

    function cleanSchemaMap(schemaId) {
        for (var prop in schemaMap) {
            if (prop.startsWith(schemaId)) {
                delete schemaMap[prop];
            }
        }
    }

    function cleanData(schemaId) {
        var expression = new Expression(schemaId);
        expression.visit(data, function(data, parent, property) {
            delete parent[property];
        });
    }

    function onDependencyChanged(name, source) {

        var arr = dependencyMap[name];
        if (!arr || !obj.schemaResolver) {
            return;
        }
        var cb = function(schemas) {
            if (schemas) {
                for (var id in schemas) {
                    if (JSON.stringify(schemaMap[id]) !== JSON.stringify(schemas[id])) {
                        cleanSchemaMap(id);
                        cleanData(id);
                        populateSchemaMap(id, schemas[id]);
                        var renderInfo = renderInfoMap[id];
                        if (renderInfo) {
                            render(renderInfo.titleContainer, renderInfo.container, id, renderInfo.parentObject, renderInfo.propertyProvider, renderInfo.value);
                        }
                    }
                }
            }
            BrutusinForms.onResolutionFinished(source);
        };
        BrutusinForms.onResolutionStarted(source);
        obj.schemaResolver(arr, obj.getData(), cb);
    }

    function Expression(exp) {
        if (exp === null || exp.length === 0 || exp === ".") {
            exp = "$";
        }
        var queue = new Array();
        var tokens = parseTokens(exp);
        var isInBracket = false;
        var numInBracket = 0;
        var sb = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token === "[") {
                if (isInBracket) {
                    throw ("Error parsing expression '" + exp + "': Nested [ found");
                }
                isInBracket = true;
                numInBracket = 0;
                sb = sb + token;
            } else if (token === "]") {
                if (!isInBracket) {
                    throw ("Error parsing expression '" + exp + "': Unbalanced ] found");
                }
                isInBracket = false;
                sb = sb + token;
                queue[queue.length] = sb;
                sb = "";
            } else {
                if (isInBracket) {
                    if (numInBracket > 0) {
                        throw ("Error parsing expression '" + exp + "': Multiple tokens found inside a bracket");
                    }
                    sb = sb + token;
                    numInBracket++;
                } else {
                    queue[queue.length] = token;
                }
            }
            if (i === tokens.length - 1) {
                if (isInBracket) {
                    throw ("Error parsing expression '" + exp + "': Unbalanced [ found");
                }
            }
        }
        this.exp = exp;
        this.queue = queue;
        this.visit = function(data, visitor) {
            function visit(name, queue, data, parentData, property) {
                if (data == null) {
                    return;
                }
                var currentToken = queue.shift();
                if (currentToken === "$") {
                    name = "$";
                    var currentToken = queue.shift();
                }
                if (!currentToken) {
                    visitor(data, parentData, property);
                } else if (Array.isArray(data)) {
                    if (!currentToken.startsWith("[")) {
                        throw ("Node '" + name + "' is of type array");
                    }
                    var element = currentToken.substring(1, currentToken.length - 1);
                    if (element.equals("#")) {
                        for (var i = 0; i < data.length; i++) {
                            var child = data[i];
                            visit(name + currentToken, queue.slice(0), child, data, i);
                            visit(name + "[" + i + "]", queue.slice(0), child, data, i);
                        }
                    } else if (element === "$") {
                        var child = data[data.length - 1];
                        visit(name + currentToken, queue.slice(0), child, data, data.length - 1);
                    } else {
                        var index = parseInt(element);
                        if (isNaN(index)) {
                            throw ("Element '" + element + "' of node '" + name + "' is not an integer, or the '$' last element symbol,  or the wilcard symbol '#'");
                        }
                        if (index < 0) {
                            throw ("Element '" + element + "' of node '" + name + "' is lower than zero");
                        }
                        var child = data[index];
                        visit(name + currentToken, queue.slice(0), child, data, index);
                    }
                } else if ("object" === typeof data) {
                    if (currentToken === "[*]") {
                        for (var p in data) {
                            var child = data[p];
                            visit(name + currentToken, queue.slice(0), child, data, p);
                            visit(name + "[\"" + p + "\"]", queue.slice(0), child, data, p);
                        }
                    } else {
                        var child;
                        if (currentToken.startsWith("[")) {
                            var element = currentToken.substring(1, currentToken.length - 1);
                            if (element.startsWith("\"") || element.startsWith("'")) {
                                element = element.substring(1, element.length() - 1);
                            } else {
                                throw ("Element '" + element + "' of node '" + name + "' must be a string expression or wilcard '*'");
                            }
                            name = name + currentToken;
                            child = data[element];
                        } else {
                            if (name.length > 0) {
                                name = name + "." + currentToken;
                            } else {
                                name = currentToken;
                            }
                            child = data[currentToken];
                        }
                        visit(name, queue, child, data, currentToken);
                    }
                } else if ("boolean" === typeof data ||
                    "number" === typeof data ||
                    "string" === typeof data) {
                    throw ("Node is leaf but still are tokens remaining: " + currentToken);
                } else {
                    throw ("Node type '" + typeof data + "' not supported for index field '" + name + "'");
                }
            }
            visit(this.exp, this.queue, data);
        };

        function parseTokens(exp) {
            if (exp === null) {
                return null;
            }
            var ret = new Array();
            var commentChar = null;
            var start = 0;
            for (var i = 0; i < exp.length; i++) {
                if (exp.charAt(i) === '"') {
                    if (commentChar === null) {
                        commentChar = '"';
                    } else if (commentChar === '"') {
                        commentChar = null;
                        ret[ret.length] = exp.substring(start, i + 1).trim();
                        start = i + 1;
                    }
                } else if (exp.charAt(i) === '\'') {
                    if (commentChar === null) {
                        commentChar = '\'';
                    } else if (commentChar === '\'') {
                        commentChar = null;
                        ret[ret.length] = exp.substring(start, i + 1).trim();
                        start = i + 1;
                    }
                } else if (exp.charAt(i) === '[') {
                    if (commentChar === null) {
                        if (start !== i) {
                            ret[ret.length] = exp.substring(start, i).trim();
                        }
                        ret[ret.length] = "[";
                        start = i + 1;
                    }
                } else if (exp.charAt(i) === ']') {
                    if (commentChar === null) {
                        if (start !== i) {
                            ret[ret.length] = exp.substring(start, i).trim();
                        }
                        ret[ret.length] = "]";
                        start = i + 1;
                    }
                } else if (exp.charAt(i) === '.') {
                    if (commentChar === null) {
                        if (start !== i) {
                            ret[ret.length] = exp.substring(start, i).trim();
                        }
                        start = i + 1;
                    }
                } else if (i === exp.length - 1) {
                    ret[ret.length] = exp.substring(start, i + 1).trim();
                }
            }
            return ret;
        }
    };

    var utils = {
        setSelectContents: function(c) {
            _selectContents = c;
        },
        BrutusinForms: BrutusinForms,
        setRenderers: function(r) {
            return renderers = r;
        },
        setFormId: function(count) {
            return formId = "BrutusinForms#" + count;
        },
        validateDepencyMapIsAcyclic: validateDepencyMapIsAcyclic,
        appendChild: appendChild,
        createPseudoSchema: createPseudoSchema,
        getDefinition: getDefinition,
        containsStr: containsStr,
        renameRequiredPropeties: renameRequiredPropeties,
        populateSchemaMap: populateSchemaMap,
        renderTitle: renderTitle,
        getInputId: getInputId,
        validate: validate,
        clear: clear,
        render: render,
        createPropertyProvider: createPropertyProvider,
        setInitialValue: function(value) {
            return initialValue = value;
        },
        getInitialValue: getInitialValue,
        getValue: getValue,
        getSchemaId: getSchemaId,
        getParentSchemaId: getParentSchemaId,
        getSchema: getSchema,
        cleanSchemaMap: cleanSchemaMap,
        cleanData: cleanData,
        getData: function() {
            return data = renderers.getData();
        },
        setData: function(d) {
            return data = renderers.setData(d);
        },
        setRoot: function(r) {
            return root = r;
        },
        onDependencyChanged: onDependencyChanged,
        Expression: Expression,
        schemaMap: schemaMap,
        dependencyMap: dependencyMap,
        renderInfoMap: renderInfoMap
    };
    return utils;
});