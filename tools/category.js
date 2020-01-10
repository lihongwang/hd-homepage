const path = require('path'),
    del = require('del'),
    _ = require("lodash"),
    copy = require('copy-dir'),
    fs = require('fs'),
    tpl = require('./ejs/tpl'),
    util = require('./util'),
    sjspkg = require('../package.json'),
    loadTemplate = tpl.loadTemplate,
    copyTemplate = tpl.copyTemplate,
    _route = require('./route'),
    mkdir = util.mkdir,
    rmdir = util.rmdir,
    inflect = require('i')(),
    write = util.write;

exports = module.exports = {
    "add": add,
    "destroy": destroy,
    "update": update
};
let _page = {
    add: function(appPath, catDesc, name) {
        let routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            iName = name,
            cName = inflect.camelize(name),
            controllerName = inflect.camelize(iName + "_controller"),
            subName = catDesc.name; // subName: pages-home
        if (routes[subName]) {
            console.warn("the route:" + name + " has been defined!");
            return;
        }
        let subJs = loadTemplate('frontend/AdminSubCtrl.js');
        subJs.locals.name = iName;
        subJs.locals.parentCtrlName = inflect.camelize(catDesc.category + "_controller")
        subJs.locals.parentName = inflect.camelize(catDesc.category);
        subJs.locals.ctrlName = controllerName;
        mkdir(path.join(appPath, '/src/scripts/routes/' + catDesc.category), function() {
            write(appPath + '/src/scripts/routes/' + catDesc.category + "/" + controllerName + ".js", subJs.render());
        });
        routes[subName] = {
            "sub": true,
            "pathto": "/" + catDesc.category + "/" + iName,
            "data": {
                "name": subName,
                "navName": catDesc.display || iName
            },
            "controller": {
                "type": "scripts/routes/" + catDesc.category + "/" + controllerName
            }
        };
        _route.add(subName, routes[subName], true);
        if (routes[catDesc.category]) {
            routes[catDesc.category].subs = routes[catDesc.category].subs || [];
            routes[catDesc.category].subs.push(subName);
            routes[catDesc.category].subs = _.uniq(routes[catDesc.category].subs);
        }

        write(appPath + '/src/routes.json', JSON.stringify(routes, null, 2) + '\n');
    },

    remove: function(appPath, catDesc, name) {
        let routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            iName = name, //inflect.pluralize(name),
            controllerName = inflect.camelize(iName + "_controller");

        let subName = catDesc.name;
        if (routes[catDesc.category]) {
            routes[catDesc.category].subs = routes[catDesc.category].subs || [];
            routes[catDesc.category].subs = _.without(routes[catDesc.category].subs, subName);
        }
        delete routes[subName];
        util.rmfile(path.join(appPath, '/src/scripts/routes/' + catDesc.category + '/' + controllerName + ".js"));

        write(appPath + '/src/routes.json', JSON.stringify(routes, null, 2) + '\n');
    }
};

let _category = {
    add: function(appPath, catDesc, name) {
        let iName = name,
            controllerName = inflect.camelize(iName + "_controller"),
            routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            subJs = loadTemplate('frontend/CatSubCtrl.js'),
            subName = "categories-" + iName;
        // subName: "categories-home"
        subJs.locals.name = iName;
        subJs.locals.parentCtrlName = "CategoriesController";
        subJs.locals.parentName = "Categories";
        subJs.locals.ctrlName = controllerName;
        routes["categories"].subs = routes["categories"].subs || [];
        routes["categories"].subs.push(subName);
        routes["categories"].subs = _.uniq(routes["categories"].subs);
        routes[subName] = {
            "sub": true,
            "pathto": "/categories/" + iName,
            "data": {
                "name": subName,
                "navName": catDesc.display || iName
            },
            "controller": {
                "type": "scripts/routes/categories/" + controllerName
            }
        };
        _route.add(subName, routes[subName], true);
        write(path.join(appPath + '/src/scripts/routes/categories/' + controllerName + ".js"), subJs.render());
        write(path.join(appPath, '/src/routes.json'), JSON.stringify(routes, null, 2) + '\n');
    },

    remove: function(appPath, name, parentName) {
        let iName = name,
            controllerName = inflect.camelize((parentName ? parentName + "_" + iName : iName) + "_controller"),
            routes = JSON.parse(util.read(path.join(appPath, "src/routes.json"))),
            subName = "categories-" + (parentName ? parentName + "-" + iName : iName);
        routes["categories"].subs = routes["categories"].subs || [];
        routes["categories"].subs = _.without(routes["categories"].subs, subName);
        delete routes[subName];
        util.rmfile(path.join(appPath, '/src/scripts/routes/categories/' + controllerName + ".js"));
        write(path.join(appPath, '/src/routes.json'), JSON.stringify(routes, null, 2) + '\n');
    }
};

function add(catDesc) {
    let name = catDesc.name, // inflect.pluralize(catDesc.name),
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin");
    // 其他项目的分类
    if (catDesc.type == "categories") {
        _category.add(fAdminPath, catDesc, name);
    } else {
        // 主分类不需要穿件页面
        _page.add(fAdminPath, catDesc, name.split("-").pop());
    }
}

function update(catDesc) {
    let name = catDesc.name,
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin"),
        bSlaxCfg = JSON.parse(util.read(path.join(fAdminPath, "src/routes.json")));
    if (catDesc.type === "categories") name = "categories-" + name;
    bSlaxCfg[name].data.navName = catDesc.display;
    write(path.join(fAdminPath, '/src/routes.json'), JSON.stringify(bSlaxCfg, null, 2) + '\n');
}

function destroy(catDesc) {
    let name = catDesc.name, // inflect.pluralize(catDesc.name),
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin");

    // 其他项目的分类
    if (catDesc.type == "categories") {
        _category.remove(fAdminPath, name, catDesc.parentName);
    } else {
        _page.remove(fAdminPath, catDesc, name.split("-").pop());
    }
}