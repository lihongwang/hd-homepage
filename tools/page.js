const path = require('path'),
    del = require('del'),
    _ = require("lodash"),
    copy = require('copy-dir'),
    fs = require('fs'),
    tpl = require('./ejs/tpl'),
    util = require('./util'),
    sjspkg = require('../package.json'),
    _route = require('./route'),
    loadTemplate = tpl.loadTemplate,
    copyTemplate = tpl.copyTemplate,
    mkdir = util.mkdir,
    rmdir = util.rmdir,
    inflect = require('i')(),
    write = util.write;
let obj = {
    "add": add,
    "destroy": destroy,
    "update": update,
    "parse": function(name) {
        name = name || "home";
        let appPath = path.join(__dirname, "../frontend/src/apps/" + name);
        const configPath = path.join(appPath, "src/slax-config.json");
        let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        config.routes = _route.parse(name);
        return config;
    }
};

exports = module.exports = obj;

let _backend = {
    add: function(pageDesc, name, bcPath) {
        let bcCtrlJsonPath = path.join(bcPath, "controllers/api/controllers.json"),
            bcMasterPath = path.join(bcPath, "dbs/master.json"),
            bcEMasterPath = path.join(bcPath, "dbs.example/master.json"),
            masterJson = JSON.parse(util.read(bcMasterPath)),
            ctrlJson = JSON.parse(util.read(bcCtrlJsonPath)),
            iName = name,
            cName = inflect.camelize(name),
            controllerName = inflect.camelize(iName + "_controller");

        if (pageDesc._hasTable) {
            // 同步创建表，以及相关model和api controller以及路由
            let bCtrlJs = loadTemplate('backend/Controller.js'),
                bMJs = loadTemplate('backend/Model.js'),
                bdbJs = loadTemplate('backend/_db.json');
            bCtrlJs.locals.Name = cName;
            bCtrlJs.locals.name = iName;
            bMJs.locals.Name = cName;
            bMJs.locals.name = iName;
            bdbJs.locals.name = iName;
            write(bcPath + '/controllers/api/' + controllerName + ".js", bCtrlJs.render());
            write(bcPath + '/models/' + cName + ".js", bMJs.render());
            write(bcPath + '/dbs/_' + iName + ".json", bdbJs.render());
            write(bcPath + '/dbs.example/_' + iName + ".json", bdbJs.render());
            masterJson.tables.push({
                "id": masterJson.tables.length + 1,
                "name": iName,
                "spaceFileName": "_" + iName + ".json",
                "autoOpen": true
            });
            write(bcMasterPath, JSON.stringify(masterJson, null, 2) + '\n');
            write(bcEMasterPath, JSON.stringify(masterJson, null, 2) + '\n');
            ctrlJson[iName] = {
                "module": "api/" + controllerName,
                "uploadPath": iName
            };
            let rObj = {};
            rObj[iName] = ctrlJson[iName];
            _route.addBackendRoutes(iName, rObj);
        }

        // // 创建页面时默认创建页面内容管理的子导航（为page现在模板填充内容）
        // ctrlJson['contents'].extralNames = ctrlJson['contents'].extralNames || [];
        // ctrlJson['contents'].extralNames.push(iName);
        // ctrlJson['contents'].extralNames = _.uniq(ctrlJson['contents'].extralNames);
        write(bcCtrlJsonPath, JSON.stringify(ctrlJson, null, 2) + '\n');
    },
    remove: function(pageDesc, name, bcPath) {
        let bcCtrlJsonPath = path.join(bcPath, "controllers/api/controllers.json"),
            bcMasterPath = path.join(bcPath, "dbs/master.json"),
            bcEMasterPath = path.join(bcPath, "dbs.example/master.json"),
            masterJson = JSON.parse(util.read(bcMasterPath)),
            ctrlJson = JSON.parse(util.read(bcCtrlJsonPath)),
            iName = name,
            controllerName = inflect.camelize(iName + "_controller"),
            cName = inflect.camelize(name);
        if (pageDesc._hasTable) {
            util.rmfile(path.join(bcPath, "controllers/api", controllerName + ".js"));
            util.rmfile(path.join(bcPath, "models/", cName + ".js"));
            util.rmfile(path.join(bcPath, "dbs/_" + iName + ".json"));
            util.rmfile(path.join(bcPath, "dbs.example/_" + iName + ".json"));
            _.remove(masterJson.tables, function(item) {
                return item.name == iName;
            });
            write(bcMasterPath, JSON.stringify(masterJson, null, 2) + '\n');
            write(bcEMasterPath, JSON.stringify(masterJson, null, 2) + '\n');
            delete ctrlJson[iName];
        }
        // ctrlJson['contents'].extralNames = ctrlJson['contents'].extralNames || [];
        // ctrlJson['contents'].extralNames = _.without(ctrlJson['contents'].extralNames, iName);
        write(bcCtrlJsonPath, JSON.stringify(ctrlJson, null, 2) + '\n');
    }
};

let _content = {
    add: function(appPath, pageDesc, name) {
        let iName = name,
            controllerName = inflect.camelize((pageDesc.parentName ? pageDesc.parentName + "_" + iName : iName) + "_controller"),
            routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            subJs = loadTemplate('frontend/AdminSubCtrl.js'),
            subName = "contents-" + (pageDesc.parentName ? pageDesc.parentName + "-" + iName : iName);
        // subName: "contents-home-home1"
        subJs.locals.name = iName;
        subJs.locals.parentCtrlName = "ContentsController";
        subJs.locals.parentName = "Contents";
        subJs.locals.ctrlName = controllerName;
        routes["contents"].subs = routes["contents"].subs || [];
        routes["contents"].subs.push(subName);
        routes["contents"].subs = _.uniq(routes["contents"].subs);
        routes[subName] = {
            "sub": true,
            "pathto": "/contents/" + (pageDesc.parentName ? pageDesc.parentName + "/" + iName : iName),
            "data": {
                "name": subName,
                "navName": pageDesc.title || iName
            },
            "controller": {
                "type": "scripts/routes/contents/" + controllerName
            }
        };
        _route.add(subName, routes[subName], true);
        write(path.join(appPath + '/src/scripts/routes/contents/' + controllerName + ".js"), subJs.render());
        write(path.join(appPath, '/src/routes.json'), JSON.stringify(routes, null, 2) + '\n');
    },

    remove: function(appPath, name, parentName) {
        let iName = name,
            controllerName = inflect.camelize((parentName ? parentName + "_" + iName : iName) + "_controller"),
            routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            subName = "contents-" + (parentName ? parentName + "-" + iName : iName);
        routes["contents"].subs = routes["contents"].subs || [];
        routes["contents"].subs = _.without(routes["contents"].subs, subName);
        delete routes[subName];
        util.rmfile(path.join(appPath, '/src/scripts/routes/contents/' + controllerName + ".js"));
        write(path.join(appPath, '/src/routes.json'), JSON.stringify(routes, null, 2) + '\n');
    }
};
let _page = {
    add: function(appPath, pageDesc, name, isAdmin) {
        let routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            iName = name,
            cName = inflect.camelize(name),
            controllerName = inflect.camelize(iName + "_controller");

        if (routes[name]) {
            console.warn("the route:" + name + " has been defined!");
            return;
        }
        if (pageDesc.parentName) {
            controllerName = inflect.camelize(pageDesc.originName + "_controller");
            let subJs = loadTemplate('frontend/' + (isAdmin ? "AdminSubCtrl.js" : "RouteSubCtrl.js"));
            subJs.locals.name = iName;
            subJs.locals.parentCtrlName = inflect.camelize(pageDesc.parentName + "_controller")
            subJs.locals.parentName = inflect.camelize(pageDesc.parentName);
            subJs.locals.ctrlName = controllerName;
            let subName = iName; // subName: home-home1
            write(appPath + '/src/scripts/routes/' + pageDesc.parentName + "/" + controllerName + ".js", subJs.render());
            routes[subName] = {
                "sub": true,
                "pathto": "/" + pageDesc.parentName + "/" + pageDesc.originName,
                "postion": pageDesc.postion,
                "parent": pageDesc.parentName,
                "hide": pageDesc.hide,
                "data": {
                    "name": subName,
                    "navName": pageDesc.title || iName
                },
                "controller": {
                    "type": "scripts/routes/" + pageDesc.parentName + "/" + controllerName
                }
            };
            _route.add(subName, routes[subName], isAdmin);
            routes[pageDesc.parentName].subs = routes[pageDesc.parentName].subs || [];
            routes[pageDesc.parentName].subs.push(subName);
            routes[pageDesc.parentName].subs = _.uniq(routes[pageDesc.parentName].subs);
        } else {
            let routeJs = loadTemplate('frontend/' + (isAdmin ? "AdminCtrl.js" : "RouteCtrl.js"));
            routeJs.locals.name = iName;
            routeJs.locals.ctrlName = controllerName;
            mkdir(path.join(appPath, '/src/scripts/routes/' + iName), function() {
                write(appPath + '/src/scripts/routes/' + iName + "/" + controllerName + ".js", routeJs.render());
            });

            routes[iName] = {
                "pathto": "/" + iName,
                "postion": pageDesc.postion,
                "hide": pageDesc.hide,
                "data": {
                    "name": iName,
                    "navName": pageDesc.title || cName
                },
                "controller": {
                    "type": "scripts/routes/" + iName + "/" + controllerName
                }
            };
            _route.add(iName, routes[iName], isAdmin);
        }
        write(appPath + '/src/routes.json', JSON.stringify(routes, null, 2) + '\n');
    },

    remove: function(appPath, pageDesc, name) {
        let routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            iName = name, //inflect.pluralize(name),
            controllerName = inflect.camelize(iName + "_controller"),
            fAdminPath = path.join(__dirname, "../frontend/src/apps/admin");
        if (pageDesc.parentName) {
            controllerName = inflect.camelize(pageDesc.originName + "_controller");
            let subName = iName;
            routes[pageDesc.parentName].subs = routes[pageDesc.parentName].subs || [];
            routes[pageDesc.parentName].subs = _.without(routes[pageDesc.parentName].subs, subName);
            delete routes[subName];
            util.rmfile(path.join(appPath, '/src/scripts/routes/' + pageDesc.parentName + '/' + controllerName + ".js"));
        } else {
            if (routes[iName]) {
                if (routes[iName].subs) routes[iName].subs.forEach(function(sub) {
                    delete routes[sub];
                    // _content.remove(fAdminPath, sub, iName);
                });
                delete routes[iName];
                rmdir(appPath + '/src/scripts/routes/' + iName, function() {});
            }
        }
        write(appPath + '/src/routes.json', JSON.stringify(routes, null, 2) + '\n');
    }
};

function add(pageDesc) {
    let name = pageDesc.name, // inflect.pluralize(pageDesc.name),
        bcPath = path.join(__dirname, "../backend"),
        fHomePath = path.join(__dirname, "../frontend/src/apps/home"),
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin");
    // frontend-home
    _page.add(fHomePath, pageDesc, name);
    // frontend-admin
    if (pageDesc._hasAdminPage) _page.add(fAdminPath, pageDesc, name, true);
    // 添加管理后台的页面内容子导航
    // _content.add(fAdminPath, pageDesc, name);
    // backend
    _backend.add(pageDesc, name, bcPath);
}

function update(pageDesc) {
    let name = pageDesc.name, // inflect.pluralize(pageDesc.name),
        fHomePath = path.join(__dirname, "../frontend/src/apps/home"),
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin"),
        iName = name, //inflect.pluralize(name),
        aRoutesfg = JSON.parse(util.read(path.join(fAdminPath, "src/routes.json"))),
        hRoutesCfg = JSON.parse(util.read(path.join(fHomePath, "src/routes.json")));
    if (aRoutesfg[name]) aRoutesfg[name].data.navName = pageDesc.title;
    hRoutesCfg[name].data.navName = pageDesc.title;
    hRoutesCfg[name].position = pageDesc.position;
    hRoutesCfg[name].hide = pageDesc.hide;
    write(path.join(fHomePath, '/src/routes.json'), JSON.stringify(hRoutesCfg, null, 2) + '\n');
    write(path.join(fAdminPath, '/src/routes.json'), JSON.stringify(aRoutesfg, null, 2) + '\n');
}

function destroy(pageDesc) {
    let name = pageDesc.name, // inflect.pluralize(pageDesc.name),
        bcPath = path.join(__dirname, "../backend"),
        fHomePath = path.join(__dirname, "../frontend/src/apps/home"),
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin");
    // frontend-home
    _page.remove(fHomePath, pageDesc, name);
    // frontend-admin
    if (pageDesc._hasAdminPage) _page.remove(fAdminPath, pageDesc, name);
    // 管理后台内容管理子页
    // _content.remove(fAdminPath, name, pageDesc.parentName);
    // backend
    _backend.remove(pageDesc, name, bcPath);
}