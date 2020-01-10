define([
    "./utils",
    "./messages"
], function(utils, BrutusinForms) {
    var inputCounter = 0;
    var data;
    var renderers = {
        updateData: function(id, items) {
            var parentData = utils.getData();
            // TODO: 零时解决方案
            var itemIndex = id.match(/\d+/);
            if (!itemIndex) {
                itemIndex = parentData.items.length - 1;
            }
            parentData.items[itemIndex].contents = items;
            utils.setData(parentData);
        },
        getData: function() {
            return data;
        },
        setData: function(d) {
            return data = d;
        },
        fillData: function(key, value) {
            if (data) data[key] = value;
        },
        integer: function(container, id, parentObject, propertyProvider, value) {
            renderers.string(container, id, parentObject, propertyProvider, value);
        },
        number: function(container, id, parentObject, propertyProvider, value) {
            renderers.string(container, id, parentObject, propertyProvider, value);
        },
        any: function(container, id, parentObject, propertyProvider, value) {
            renderers.string(container, id, parentObject, propertyProvider, value);
        },
        string: function(container, id, parentObject, propertyProvider, value) {
            /// TODO change the handler for when there is a 'media'
            /// specifier so it becomes a file element. 
            var schemaId = utils.getSchemaId(id);
            var parentId = utils.getParentSchemaId(schemaId);
            var s = utils.getSchema(schemaId);
            var parentSchema = utils.getSchema(parentId);
            var input;
            if (s.type === "any") {
                input = document.createElement("textarea");
                if (value) {
                    input.value = JSON.stringify(value, null, 4);
                    if (s.readOnly)
                        input.disabled = true;
                }
            } else if (s.media) {
                input = document.createElement("input");
                input.type = "file";
                // XXX TODO, encode the SOB properly.
            } else if (s.enum) {
                input = document.createElement("select");
                if (!s.required) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode("-请选择-");
                    option.value = "";
                    utils.appendChild(option, textNode, s);
                    utils.appendChild(input, option, s);
                }
                // add by LHW using to save contents
                if (s._csOption) input._csCallback = function(items) {
                    function createStaticPropertyProvider(propname) {
                        var ret = new Object();
                        ret.getValue = function() {
                            return propname;
                        };
                        ret.onchange = function(oldName) {};
                        return ret;
                    };
                    var _cpp = createStaticPropertyProvider("contents");
                    var _cc = container.parentElement.nextElementSibling.lastElementChild;
                    var _cid = id.replace("contentType", "contents")
                    utils.render(null, _cc, _cid, parentObject, _cpp, items);
                    // save contents
                    renderers.updateData(id, items);
                };

                var selectedIndex = 0;
                for (var i = 0; i < s.enum.length; i++) {
                    var option = document.createElement("option");
                    var textNode = document.createTextNode(s._csOption ? s.enum[i].display : s.enum[i]);
                    option.value = s._csOption ? s.enum[i].name : s.enum[i];
                    utils.appendChild(option, textNode, s);
                    utils.appendChild(input, option, s);
                    if (value && (s._csOption ? s.enum[i].name : s.enum[i]) === value) {
                        selectedIndex = i;
                        if (!s.required) {
                            selectedIndex++;
                        }
                        if (s.readOnly)
                            input.disabled = true;
                    }
                }
                if (s.enum.length === 1)
                    input.selectedIndex = 0;
                else
                    input.selectedIndex = selectedIndex;

            } else {
                input = document.createElement("input");
                if (s.type === "integer" || s.type === "number") {
                    input.type = "number";
                    input.step = s.step ? "" + s.step : "any";
                    if (typeof value !== "number") {
                        value = null;
                    }
                } else if (s.format === "date-time") {
                    try {
                        input.type = "datetime-local";
                    } catch (err) {
                        // #46, problem in IE11. TODO polyfill?
                        input.type = "text";
                    }
                } else if (s.format === "date") {
                    input.type = "date";
                } else if (s.format === "time") {
                    input.type = "time";
                } else if (s.format === "email") {
                    input.type = "email";
                } else if (s.format === "text") {
                    input = document.createElement("textarea");
                } else {
                    input.type = "text";
                }
                if (value !== null && typeof value !== "undefined") {
                    // readOnly?
                    input.value = value;
                    if (s.readOnly)
                        input.disabled = true;

                }
            }
            input.schema = schemaId;
            input.setAttribute("autocorrect", "off");

            input.getValidationError = function() {
                try {
                    var value = utils.getValue(s, input);
                    if (value === null) {
                        if (s.required) {
                            if (parentSchema && parentSchema.type === "object") {
                                if (parentSchema.required) {
                                    return BrutusinForms.messages["required"];
                                } else {
                                    for (var prop in parentObject) {
                                        if (parentObject[prop] !== null) {
                                            return BrutusinForms.messages["required"];
                                        }
                                    }
                                }
                            } else {
                                return BrutusinForms.messages["required"];
                            }
                        }
                    } else {
                        if (s.pattern && !s.pattern.test(value)) {
                            return BrutusinForms.messages["pattern"].format(s.pattern.source);
                        }
                        if (s.minLength) {
                            if (!value || s.minLength > value.length) {
                                return BrutusinForms.messages["minLength"].format(s.minLength);
                            }
                        }
                        if (s.maxLength) {
                            if (value && s.maxLength < value.length) {
                                return BrutusinForms.messages["maxLength"].format(s.maxLength);
                            }
                        }
                    }
                    if (value !== null && !isNaN(value)) {
                        if (s.multipleOf && value % s.multipleOf !== 0) {
                            return BrutusinForms.messages["multipleOf"].format(s.multipleOf);
                        }
                        if (s.hasOwnProperty("maximum")) {
                            if (s.exclusiveMaximum && value >= s.maximum) {
                                return BrutusinForms.messages["exclusiveMaximum"].format(s.maximum);
                            } else if (!s.exclusiveMaximum && value > s.maximum) {
                                return BrutusinForms.messages["maximum"].format(s.maximum);
                            }
                        }
                        if (s.hasOwnProperty("minimum")) {
                            if (s.exclusiveMinimum && value <= s.minimum) {
                                return BrutusinForms.messages["exclusiveMinimum"].format(s.minimum);
                            } else if (!s.exclusiveMinimum && value < s.minimum) {
                                return BrutusinForms.messages["minimum"].format(s.minimum);
                            }
                        }
                    }
                } catch (error) {
                    return BrutusinForms.messages["invalidValue"];
                }
            };

            input.onchange = function() {
                var value;
                try {
                    value = utils.getValue(s, input);
                } catch (error) {
                    value = null;
                }
                if (parentObject) {
                    parentObject[propertyProvider.getValue()] = value;
                } else {
                    data = value;
                }
                utils.onDependencyChanged(schemaId, input);
            };

            if (s.description) {
                input.title = s.description;
                input.placeholder = s.description;
            }
            //        if (s.pattern) {
            //            input.pattern = s.pattern;
            //        }
            //        if (s.required) {
            //            input.required = true;
            //        }
            //       
            //        if (s.minimum) {
            //            input.min = s.minimum;
            //        }
            //        if (s.maximum) {
            //            input.max = s.maximum;
            //        }
            input.onchange();
            input.id = utils.getInputId();
            inputCounter++;
            utils.appendChild(container, input, s);
            return parentObject;
        },
        boolean: function(container, id, parentObject, propertyProvider, value) {
            var schemaId = utils.getSchemaId(id);
            var s = utils.getSchema(schemaId);
            var input;
            if (s.required) {
                input = document.createElement("input");
                input.type = "checkbox";
                if (value === true || value !== false && s.default) {
                    input.checked = true;
                }
            } else {
                input = document.createElement("select");
                var emptyOption = document.createElement("option");
                var textEmpty = document.createTextNode("");
                textEmpty.value = "";
                utils.appendChild(emptyOption, textEmpty, s);
                utils.appendChild(input, emptyOption, s);

                var optionTrue = document.createElement("option");
                var textTrue = document.createTextNode(BrutusinForms.messages["true"]);
                optionTrue.value = "true";
                utils.appendChild(optionTrue, textTrue, s);
                utils.appendChild(input, optionTrue, s);

                var optionFalse = document.createElement("option");
                var textFalse = document.createTextNode(BrutusinForms.messages["false"]);
                optionFalse.value = "false";
                utils.appendChild(optionFalse, textFalse, s);
                utils.appendChild(input, optionFalse, s);

                if (value === true) {
                    input.selectedIndex = 1;
                } else if (value === false) {
                    input.selectedIndex = 2;
                }
            }
            input.onchange = function() {
                if (parentObject) {
                    parentObject[propertyProvider.getValue()] = utils.getValue(s, input);
                } else {
                    data = utils.getValue(s, input);
                }
                utils.onDependencyChanged(schemaId, input);
            };
            input.schema = schemaId;
            input.id = getInputId();
            inputCounter++;
            if (s.description) {
                input.title = s.description;
            }
            input.onchange();
            utils.appendChild(container, input, s);
        },
        oneOf: function(container, id, parentObject, propertyProvider, value) {
            var schemaId = utils.getSchemaId(id);
            var s = utils.getSchema(schemaId);
            var input = document.createElement("select");
            var display = document.createElement("div");
            display.innerHTML = "";
            input.type = "select";
            input.schema = schemaId;
            var noption = document.createElement("option");
            noption.value = null;
            utils.appendChild(input, noption, s);
            for (var i = 0; i < s.oneOf.length; i++) {
                var option = document.createElement("option");
                var propId = schemaId + "." + i;
                var ss = utils.getSchema(propId);
                var textNode = document.createTextNode(ss.title);
                option.value = s.oneOf[i];
                utils.appendChild(option, textNode, s);
                utils.appendChild(input, option, s);
                if (value === undefined || value === null)
                    continue;
                if (s.readOnly)
                    input.disabled = true;
                if (value.hasOwnProperty("type")) {
                    if (ss.hasOwnProperty("properties")) {
                        if (ss.properties.hasOwnProperty("type")) {
                            var tryit = utils.getSchema(ss.properties.type);
                            if (value.type === tryit.enum[0]) {
                                input.selectedIndex = i + 1;
                                utils.render(null, display, id + "." + (input.selectedIndex - 1), parentObject, propertyProvider, value);
                            }
                        }
                    }
                }
            }
            input.onchange = function() {
                utils.render(null, display, id + "." + (input.selectedIndex - 1), parentObject, propertyProvider, value);
            };
            utils.appendChild(container, input, s);
            utils.appendChild(container, display, s);

        },
        object: function(container, id, parentObject, propertyProvider, value) {

            function createStaticPropertyProvider(propname) {
                var ret = new Object();
                ret.getValue = function() {
                    return propname;
                };
                ret.onchange = function(oldName) {};
                return ret;
            }

            function addAdditionalProperty(current, table, id, name, value, pattern) {
                var schemaId = utils.getSchemaId(id);
                var s = utils.getSchema(schemaId);
                var tbody = table.tBodies[0];
                var tr = document.createElement("tr");
                var td1 = document.createElement("td");
                td1.className = "add-prop-name";
                var innerTab = document.createElement("table");
                var innerTr = document.createElement("tr");
                var innerTd1 = document.createElement("td");
                var innerTd2 = document.createElement("td");
                var keyForBlank = "$" + Object.keys(current).length + "$";
                var td2 = document.createElement("td");
                td2.className = "prop-value";
                var nameInput = document.createElement("input");
                nameInput.type = "text";
                var regExp;
                if (pattern) {
                    regExp = RegExp(pattern);
                }
                nameInput.getValidationError = function() {
                    if (nameInput.previousValue !== nameInput.value) {
                        if (current.hasOwnProperty(nameInput.value)) {
                            return BrutusinForms.messages["addpropNameExistent"];
                        }
                    }
                    if (!nameInput.value) {
                        return BrutusinForms.messages["addpropNameRequired"];
                    }
                };
                var pp = utils.createPropertyProvider(
                    function() {
                        if (nameInput.value) {
                            if (regExp) {
                                if (nameInput.value.search(regExp) !== -1) {
                                    return nameInput.value;
                                }
                            } else {
                                return nameInput.value;
                            }
                        }
                        return keyForBlank;
                    },
                    function(oldPropertyName) {
                        if (pp.getValue() === oldPropertyName) {
                            return;
                        }
                        if (!oldPropertyName || !current.hasOwnProperty(oldPropertyName)) {
                            oldPropertyName = keyForBlank;
                        }
                        if (current.hasOwnProperty(oldPropertyName) || regExp && pp.getValue().search(regExp) === -1) {
                            current[pp.getValue()] = current[oldPropertyName];
                            delete current[oldPropertyName];
                        }
                    });

                nameInput.onblur = function() {
                    if (nameInput.previousValue !== nameInput.value) {
                        var name = nameInput.value;
                        var i = 1;
                        while (nameInput.previousValue !== name && current.hasOwnProperty(name)) {
                            name = nameInput.value + "(" + i + ")";
                            i++;
                        }
                        nameInput.value = name;
                        pp.onchange(nameInput.previousValue);
                        nameInput.previousValue = nameInput.value;
                        return;
                    }
                };
                var removeButton = document.createElement("button");
                removeButton.setAttribute('type', 'button');
                removeButton.className = "remove";
                utils.appendChild(removeButton, document.createTextNode("x"), s);
                removeButton.onclick = function() {
                    delete current[nameInput.value];
                    table.deleteRow(tr.rowIndex);
                    nameInput.value = null;
                    pp.onchange(nameInput.previousValue);
                };
                utils.appendChild(innerTd1, nameInput, s);
                utils.appendChild(innerTd2, removeButton, s);
                utils.appendChild(innerTr, innerTd1, s);
                utils.appendChild(innerTr, innerTd2, s);
                utils.appendChild(innerTab, innerTr, s);
                utils.appendChild(td1, innerTab, s);

                if (pattern !== undefined) {
                    nameInput.placeholder = pattern;
                }

                utils.appendChild(tr, td1, s);
                utils.appendChild(tr, td2, s);
                utils.appendChild(tbody, tr, s);
                utils.appendChild(table, tbody, s);
                utils.render(null, td2, id, current, pp, value);

                if (name) {
                    nameInput.value = name;
                    nameInput.onblur();
                }
            }

            var schemaId = utils.getSchemaId(id);
            var s = utils.getSchema(schemaId);
            var current = new Object();
            if (!parentObject) {
                data = current;
            } else {
                if (propertyProvider.getValue() || propertyProvider.getValue() === 0) {
                    parentObject[propertyProvider.getValue()] = current;
                }
            }
            var table = document.createElement("table");
            table.className = "object";
            var tbody = document.createElement("tbody");
            utils.appendChild(table, tbody, s);
            var propNum = 0;
            if (s.hasOwnProperty("properties")) {
                propNum = s.properties.length;
                for (var prop in s.properties) {
                    var tr = document.createElement("tr");
                    var td1 = document.createElement("td");
                    td1.className = "prop-name";
                    var propId = id + "." + prop;
                    var propSchema = utils.getSchema(utils.getSchemaId(propId));

                    var td2 = document.createElement("td");
                    td2.className = "prop-value";

                    // add by LHW, using to judge content select
                    if (propSchema.className) {
                        tr.setAttribute("class", propSchema.className);
                    }

                    utils.appendChild(tbody, tr, propSchema);
                    utils.appendChild(tr, td1, propSchema);
                    utils.appendChild(tr, td2, propSchema);
                    var pp = createStaticPropertyProvider(prop);
                    var propInitialValue = null;
                    if (value) {
                        propInitialValue = value[prop];
                    }
                    utils.render(td1, td2, propId, current, pp, propInitialValue);
                }
            }
            var usedProps = [];
            if (s.patternProperties || s.additionalProperties) {
                var div = document.createElement("div");
                utils.appendChild(div, table, s);
                if (s.patternProperties) {
                    for (var pattern in s.patternProperties) {
                        var patProps = s.patternProperties[pattern];
                        var patdiv = document.createElement("div");
                        patdiv.className = "add-pattern-div";
                        var addButton = document.createElement("button");
                        addButton.setAttribute('type', 'button');
                        addButton.pattern = pattern;
                        addButton.id = id + "[" + pattern + "]";
                        addButton.onclick = function() {
                            addAdditionalProperty(current, table, this.id, undefined, undefined, this.pattern);
                        };
                        if (s.maxProperties || s.minProperties) {
                            addButton.getValidationError = function() {
                                if (s.minProperties && propNum + table.rows.length < s.minProperties) {
                                    return BrutusinForms.messages["minProperties"].format(s.minProperties);
                                }
                                if (s.maxProperties && propNum + table.rows.length > s.maxProperties) {
                                    return BrutusinForms.messages["maxProperties"].format(s.maxProperties);
                                }
                            };
                        }
                        if (patProps.description) {
                            addButton.title = patProps.description;
                        }
                        utils.appendChild(addButton, document.createTextNode("Add " + pattern), s);
                        utils.appendChild(patdiv, addButton, s);
                        if (value) {
                            for (var p in value) {
                                if (s.properties && s.properties.hasOwnProperty(p)) {
                                    continue;
                                }
                                var r = RegExp(pattern);
                                if (p.search(r) === -1) {
                                    continue;
                                }
                                if (usedProps.indexOf(p) !== -1) {
                                    continue;
                                }
                                addAdditionalProperty(current, table, id + "[" + pattern + "]", p, value[p], pattern);
                                usedProps.push(p);
                            }
                        }
                        utils.appendChild(div, patdiv, s);
                    }
                }
                if (s.additionalProperties) {
                    var addPropS = utils.getSchema(s.additionalProperties);
                    var addButton = document.createElement("button");
                    addButton.setAttribute('type', 'button');
                    addButton.onclick = function() {
                        addAdditionalProperty(current, table, id + "[*]", undefined);
                    };
                    if (s.maxProperties || s.minProperties) {
                        addButton.getValidationError = function() {
                            if (s.minProperties && propNum + table.rows.length < s.minProperties) {
                                return BrutusinForms.messages["minProperties"].format(s.minProperties);
                            }
                            if (s.maxProperties && propNum + table.rows.length > s.maxProperties) {
                                return BrutusinForms.messages["maxProperties"].format(s.maxProperties);
                            }
                        };
                    }
                    if (addPropS.description) {
                        addButton.title = addPropS.description;
                    }
                    utils.appendChild(addButton, document.createTextNode("Add"), s);
                    utils.appendChild(div, addButton, s);
                    if (value) {
                        for (var p in value) {
                            if (s.properties && s.properties.hasOwnProperty(p)) {
                                continue;
                            }
                            if (usedProps.indexOf(p) !== -1) {
                                continue;
                            }
                            addAdditionalProperty(current, table, id + "[\"" + prop + "\"]", p, value[p]);
                        }
                    }
                }
                utils.appendChild(container, div, s);
            } else {
                utils.appendChild(container, table, s);
            }
        },
        array: function(container, id, parentObject, propertyProvider, value) {
            function addItem(current, table, id, value, readOnly) {
                var schemaId = utils.getSchemaId(id);
                var s = utils.getSchema(schemaId);
                var tbody = document.createElement("tbody");
                var tr = document.createElement("tr");
                tr.className = "item";
                var td1 = document.createElement("td");
                td1.className = "item-index";
                var td2 = document.createElement("td");
                td2.className = "item-action";
                var td3 = document.createElement("td");
                td3.className = "item-value";
                var removeButton = document.createElement("button");
                removeButton.setAttribute('type', 'button');
                removeButton.className = "remove";
                if (readOnly === true)
                    removeButton.disabled = true;
                utils.appendChild(removeButton, document.createTextNode("x"), s);
                var computRowCount = function() {
                    for (var i = 0; i < table.rows.length; i++) {
                        var row = table.rows[i];
                        row.cells[0].innerHTML = i + 1;
                    }
                };
                removeButton.onclick = function() {
                    current.splice(tr.rowIndex, 1);
                    table.deleteRow(tr.rowIndex);
                    computRowCount();
                };
                utils.appendChild(td2, removeButton, s);
                var number = document.createTextNode(table.rows.length + 1);
                utils.appendChild(td1, number, s);
                utils.appendChild(tr, td1, s);
                utils.appendChild(tr, td2, s);
                utils.appendChild(tr, td3, s);
                utils.appendChild(tbody, tr, s);
                utils.appendChild(table, tbody, s);
                var pp = utils.createPropertyProvider(function() {
                    return tr.rowIndex;
                });
                utils.render(null, td3, id, current, pp, value);
            }

            var schemaId = utils.getSchemaId(id);
            var s = utils.getSchema(schemaId);
            var itemS = utils.getSchema(s.items);
            var current = new Array();
            if (!parentObject) {
                data = current;
            } else {
                if (propertyProvider.getValue() || propertyProvider.getValue() === 0) {
                    parentObject[propertyProvider.getValue()] = current;
                }
            }
            if (propertyProvider) {
                propertyProvider.onchange = function(oldPropertyName) {
                    delete parentObject[oldPropertyName];
                    parentObject[propertyProvider.getValue()] = current;
                };
            }
            var div = document.createElement("div");
            var table = document.createElement("table");
            table.className = "array";
            utils.appendChild(div, table, s);
            utils.appendChild(container, div, s);
            utils.appendChild(div, table, s);
            if (s._innerContent) {
                renderers.updateData(id, value);
                console.log("inner");
            } else {
                var addButton = document.createElement("button");
                if (s.readOnly)
                    addButton.disabled = true;
                addButton.setAttribute('type', 'button');
                addButton.className = "addItem";
                addButton.getValidationError = function() {
                    if (s.minItems && s.minItems > table.rows.length) {
                        return BrutusinForms.messages["minItems"].format(s.minItems);
                    }
                    if (s.maxItems && s.maxItems < table.rows.length) {
                        return BrutusinForms.messages["maxItems"].format(s.maxItems);
                    }
                    if (s.uniqueItems) {
                        for (var i = 0; i < current.length; i++) {
                            for (var j = i + 1; j < current.length; j++) {
                                if (JSON.stringify(current[i]) === JSON.stringify(current[j])) {
                                    return BrutusinForms.messages["uniqueItems"];
                                }
                            }
                        }
                    }
                };
                addButton.onclick = function() {
                    addItem(current, table, id + "[#]", null);
                };
                if (itemS.description) {
                    addButton.title = itemS.description;
                }
                utils.appendChild(addButton, document.createTextNode(BrutusinForms.messages["addItem"]), s);
                utils.appendChild(div, addButton, s);
            }

            if (value && value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    addItem(current, table, id + "[" + i + "]", value[i], s.readOnly);
                }
            }
            utils.appendChild(container, div, s);
        }
    };
    utils.setRenderers(renderers);
});