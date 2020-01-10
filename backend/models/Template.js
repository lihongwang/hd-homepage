'use strict';
const Model = require("./_Base").Model,
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs');

exports.Template = class Template extends Model {
    static list(sortKey = "status", direction = "asc") {
        return Model.list("templates", sortKey, direction);
    }
    static findBy(args) {
        return Model.findBy("templates", args);
    }
    static findAll(args) {
        return Model.findAll("templates", args);
    }
    static findByReg(args) {
        return Model.findByReg("templates", args);
    }
    static where(key, value, chainAble) {
        return Model.where("templates", key, value, chainAble);
    }
    static create(args) {
        if (!args.publishedDate) args.publishedDate = new Date();
        args.published = 'true';
        args.publishedDate = new Date(args.publishedDate);
        return Model.create("templates", args);
    }
    static update(args) {
        if (!args.publishedDate) args.publishedDate = new Date();
        args.publishedDate = new Date(args.publishedDate);
        return Model.update("templates", "id", args);
    }
    static delete(args) {
        return Model.delete("templates", args);
    }
    static importData() {
        let templates = JSON.parse(fs.readFileSync(path.join(__dirname, "../dbs/templates.json"), 'utf8'));
        let results = [];
        templates.forEach(function(page) {
            results.push(Model.findOrCreate("templates", "name", page));
        });
        return results;
    }
    static exportData() {

    }
}