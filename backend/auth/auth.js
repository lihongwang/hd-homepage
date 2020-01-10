const passport = require('passport');
require("./passport.js");
module.exports = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
};