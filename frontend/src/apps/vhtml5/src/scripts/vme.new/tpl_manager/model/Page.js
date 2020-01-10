define(['exports', 'module', './Page'], function(exports, module, Page) {
    'use strict';

    var Backbone = require('backbone');

    module.exports = Backbone.Collection.extend({
        model: Page
    });
});