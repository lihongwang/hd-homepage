'use strict';
const Model = require("./_Base").Model,
    path = require('path'),
    _ = require('lodash'),
    Template = require("./Template").Template,
    fs = require('fs');

exports.Content = class Content extends Model {
    static list(sortKey = "updatedAt", direction = "asc") {
        return Model.list("contents", sortKey, direction);
    }
    static findBy(args) {
        return Model.findBy("contents", args);
    }
    static findAll(args) {
        return Model.findAll("contents", args);
    }
    static findByReg(args) {
        return Model.findByReg("contents", args);
    }
    static where(key, value, chainAble) {
        return Model.where("contents", key, value, chainAble);
    }
    static withTemplate(chain) {
        return chain.map(function(p) {
            p.template = Template.findBy({
                id: p.templateId
            });
            return p;
        });
    }
    static format(chain, keys) {
        if (keys) {
            return chain.map(function(p) {
                let obj = {};
                keys.forEach(function(key) {
                    obj[key] = p[key];
                });
                return obj;
            });
        } else {
            return chain.map(function(p) {
                return {
                    id: p.id
                };
            });
        }
    }
    static create(args) {
        if (args.sub) args.sub = JSON.parse(args.sub);
        if (args._content) {
            args._content = JSON.parse(args._content);
            // if (args._content.items.length) args._content.category = args._content.items[0].category;
        }

        return Model.create("contents", args);
    }
    static update(args) {
        if (args.sub) args.sub = JSON.parse(args.sub);
        if (args._content) {
            args._content = JSON.parse(args._content);
            // if (args._content.items.length) args._content.category = args._content.items[0].category;
        }
        return Model.update("contents", "id", args);
    }
    static delete(args) {
        return Model.delete("contents", args);
    }
}