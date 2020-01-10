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
let _site = {
    add: function(appPath, siteDesc, name) {
        let slaxCfg = loadTemplate('frontend/sites/slax-config.json');
        slaxCfg.locals.name = name;
        slaxCfg.locals.domain = siteDesc.domain;
        let indexHtml = loadTemplate('frontend/sites/index.html');
        indexHtml.locals.title = siteDesc.title;
        indexHtml.locals.description = siteDesc.description;
        indexHtml.locals.keywords = siteDesc.keywords;
        mkdir(path.join(appPath, name, "src"), function() {
            write(appPath + name + '/src/slax-config.json', slaxCfg.render());
            write(appPath + name + '/src/index.html', slaxCfg.render());
            copy(path.join(__dirname, "ejs/frontend/sites/assets"), path.join(appPath, name, "src"), function() {});
            copy(path.join(__dirname, "ejs/frontend/sites/scripts"), path.join(appPath, name, "src"), function() {});
        });
    },

    remove: function(appPath, siteDesc, name) {
        rmdir(path.join(appPath, name), function() {});
    }
};

function add(siteDesc) {
    let name = siteDesc.name, // inflect.pluralize(siteDesc.name),
        appPath = path.join(__dirname, "../frontend/src/apps/");
    _site.add(appPath, siteDesc, name);
}

function update(siteDesc) {
    let name = siteDesc.name,
        fAdminPath = path.join(__dirname, "../frontend/src/apps/admin"),
        bSlaxCfg = JSON.parse(util.read(path.join(fAdminPath, "src/routes.json")));
    if (siteDesc.type === "categories") name = "categories-" + name;
    bSlaxCfg[name].data.navName = siteDesc.display;
    write(path.join(fAdminPath, '/src/routes.json'), JSON.stringify(bSlaxCfg, null, 2) + '\n');
}

function destroy(siteDesc) {
    let name = siteDesc.name, // inflect.pluralize(siteDesc.name),
        appPath = path.join(__dirname, "../frontend/src/apps/");
    _site.remove(appPath, siteDesc, name);
}