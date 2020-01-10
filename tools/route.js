const path = require('path'),
    dynamicRoute = require('../backend/routes/dynamic');

exports = module.exports = {
    add: function(name, obj, isAdmin) {
        let routeObj = {};
        routeObj[name] = obj;
        dynamicRoute.addFrontendRoutes(routeObj, isAdmin, {
            contextPath: isAdmin ? "/admin" : "",
            rootDir: path.join(__dirname, "../frontend/src/apps/" + (isAdmin ? "admin" : "home") + "/src")
        });
    },

    addBackendRoutes: function(key, ctrl) {
        dynamicRoute.addBackendRoutes(key, ctrl);
    },

    parse: dynamicRoute.parse
}