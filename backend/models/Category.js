'use strict';
const Model = require("./_Base").Model,
    _ = require('lodash'),
    Page = require("./Page").Page,
    catExt = require("../../tools/category"),
    path = require('path'),
    fs = require('fs');

exports.Category = class Category extends Model {
    static list(sortKey = "status", direction = "asc") {
        return Model.list("categories", sortKey, direction);
    }
    static findBy(args) {
        return Model.findBy("categories", args);
    }
    static selectableList() {
        return _.concat(["page"], Page.where("categorical", true, true).map(function(page) { return page.name; }));
    }
    static findAll(args) {
        return Model.findAll("categories", args);
    }
    static findOrCreate(key, args) {
        return Model.findOrCreate("categories", key, args);
    }
    static findByReg(args) {
        return Model.findByReg("categories", args);
    }
    static where(key, value, chainAble) {
        return Model.where("categories", key, value, chainAble);
    }
    static create(args) {
        if ("_contentSelectable" in args) {
            args._contentSelectable = (args._contentSelectable == 'true' || args._contentSelectable == true);
        }
        let result = Model.create("categories", args);
        catExt.add(result);
        return result;
    }
    static update(args) {
        if ("_contentSelectable" in args) {
            args._contentSelectable = (args._contentSelectable == 'true' || args._contentSelectable == true);
        }
        let result = Model.update("categories", "id", args);
        catExt.update(result.value());
        return result;
    }
    static delete(args) {
        let result = Model.findBy("categories", args);
        catExt.destroy(result);
        return Model.delete("categories", args);
    }
}