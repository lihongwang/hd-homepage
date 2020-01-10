'use strict';

const express = require('express');
const _app = require('./application');
const routes = require(_app.routePath + "/routes");

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    if (req.method == "POST") {
        res.json({ status: false, auth: true, msg: "please login!" });
    } else {
        res.redirect('/signin');
    }
}
module.exports = function(app) {
    routes(app, ensureAuthenticated);
};