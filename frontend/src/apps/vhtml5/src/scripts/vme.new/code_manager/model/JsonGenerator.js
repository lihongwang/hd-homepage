define(['exports', 'module'], function(exports, module) {
    'use strict';

    var Backbone = require('backbone');

    module.exports = Backbone.Model.extend({
        /** @inheritdoc */
        build: function build(model) {
            var json = model.toJSON();
            this.beforeEach(json);

            _.each(json, function(v, attr) {
                var obj = json[attr];
                if (obj instanceof Backbone.Model) {
                    json[attr] = this.build(obj);
                } else if (obj instanceof Backbone.Collection) {
                    var coll = obj;
                    json[attr] = [];
                    if (coll.length) {
                        coll.each(function(el, index) {
                            json[attr][index] = this.build(el);
                        }, this);
                    }
                }
            }, this);

            return json;
        },

        /**
         * Execute on each object
         * @param {Object} obj
         */
        beforeEach: function beforeEach(obj) {
            delete obj.status;
        }
    });
});