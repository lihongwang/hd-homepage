'use strict';

const path = require("path"),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    _ = require('lodash'),
    _app = require('../config/application'),
    dynamicRoute = require('./dynamic');

let __app, __ensureAuthenticated;

function load(app, ensureAuthenticated) {
    let ctrlsPath = path.join(__dirname, "../controllers/api/controllers.json");
    let ctrls = JSON.parse(fs.readFileSync(ctrlsPath, 'utf8'));
    // api
    _(Object.keys(ctrls)).each(function(key) {
        dynamicRoute.addBackendRoutes(key, ctrls);
    });
    app.get('/api/sites/admin', function(req, res) {
        var sites = require(path.join(_app.backendPath, "controllers", ctrls.sites.module));
        sites.admin(req, res);
    });
    app.post('/api/messages/send', function(req, res) {
        var messages = require(path.join(_app.backendPath, "controllers", ctrls.messages.module));
        messages.send(req, res);
    });
};

module.exports = {
    start: function(app, ensureAuthenticated) {
        if (!fs.existsSync(_app.publicPath)) mkdirp(_app.publicPath);
        __app = app;
        __ensureAuthenticated = ensureAuthenticated;
        load(app, ensureAuthenticated);
    },

    // restart: function() {
    //     load(__app, __ensureAuthenticated);
    // }
};