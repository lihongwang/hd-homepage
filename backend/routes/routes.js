const passport = require('passport'),
    path = require('path'),
    dynamicRoute = require('./dynamic'),
    auth = require('./_auth'),
    api = require("./_api");

module.exports = function(app, ensureAuthenticated) {
    require("../mail/quick-send").initMailer(app.mailer);
    dynamicRoute.init(app, ensureAuthenticated);
    api.start(app, ensureAuthenticated);
    auth(app, ensureAuthenticated);
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        // let err = new Error('Not Found');
        // err.status = 404;
        next();
    });
};