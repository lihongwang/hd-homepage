'use strict';
const Model = require("./_Base").Model,
    path = require('path'),
    siteExt = require('../../tools/site'),
    fs = require('fs');

exports.Site = class Site extends Model {
    static list(sortKey = "status", direction = "asc") {
        return Model.list("sites", sortKey, direction);
    }
    static first() {
        return Model.first("sites");
    }
    static findBy(args) {
        return Model.findBy("sites", args);
    }
    static findAll(args) {
        return Model.findAll("sites", args);
    }
    static findByReg(args) {
        return Model.findByReg("sites", args);
    }
    static create(args) {
        if (args._content) args._content = JSON.parse(args._content);
        args.domain = args.domain.match(/^\//) ? args.domain : "/" + args.domain;
        let result = Model.create("sites", args);
        siteExt.add(result);
        return result;
    }
    static update(args) {
        if (args._content) args._content = JSON.parse(args._content);
        let result = Model.update("sites", "id", args);
        if (args.domain != result.domain) siteExt.update(result);
        return result;
    }
    static delete(args) {
        let result = Model.findBy("sites", args);
        siteExt.destroy(result);
        return Model.delete("sites", args);
    }
}