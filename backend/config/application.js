'use strict';
const path = require('path'),
    configure = require('./application.json'),
    dbms = require('skynode-jsonlite'),
    _ = require('lodash'),
    shortid = require('shortid');

let _exports = {
    contactMail: "contact@hudaokeji.com"
};

for (let key in configure.pathInfo) {
    _exports[key] = path.join(__dirname, configure.pathInfo[key]);
}

_exports.refreshDb = function() {
    return dbms(_exports.dbPath, {
        master_file_name: "master.json"
    });
};
module.exports = _exports;