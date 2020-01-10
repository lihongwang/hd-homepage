'use strict';
const Model = require("./_Base").Model,
    path = require('path'),
    _ = require('lodash'),
    inflect = require('i')(),
    pageExt = require('../../tools/page'),
    fs = require('fs');

exports.Page = class Page extends Model {
    static list(sortKey = "status", direction = "asc") {
        return Model.list("pages", sortKey, direction);
    }
    static findBy(args) {
        return Model.findBy("pages", args);
    }
    static findAll(args) {
        return Model.findAll("pages", args);
    }
    static findByReg(args) {
        return Model.findByReg("pages", args);
    }
    static where(key, value, chainAble) {
        return Model.where("pages", key, value, chainAble);
    }
    static public(chain) {
        return chain.filter(function(p) { return !p.hide; }).sortBy(function(element) {
            return _.get(element, "postion");
        }).value();
    }
    static mains(chainAble) {
        return Model.where("pages", "category", "pages_mains", chainAble)
    }
    static subs(chainAble) {
        return Model.where("pages", "category", "pages_subs", chainAble)
    }
    static create(args) {
        if ("hide" in args) {
            args.hide = (args.hide == 'true' || args.hide == true);
        }
        if ("_hasAdminPage" in args) {
            args._hasAdminPage = (args._hasAdminPage == 'true' || args._hasAdminPage == true);
        }
        if ("_hasTable" in args) {
            args._hasTable = (args._hasTable == 'true' || args._hasTable == true);
        }
        args.pathto = args.pathto.match(/^\//) ? args.pathto : "/" + args.pathto;
        if (args.parent) {
            let parent = Model.findBy("pages", {
                id: args.parent
            });
            args.parentName = parent.name;
            args.pathto = parent.pathto + args.pathto;
            args.originName = args.name;
            args.name = args.parentName + "-" + args.name;
        }
        let result = Model.create("pages", args);
        pageExt.add(result);
        return result;
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
            return chain;
        }
    }
    static homePage(chain) {
        return _.reduce(chain, function(obj, param) {
            param.data = {
                "name": param.name,
                "navName": param.title
            };
            obj[param.name] = param
            return obj;
        }, {});
    }
    static update(args) {
        if ("hide" in args) {
            args.hide = (args.hide == 'true' || args.hide == true);
        }
        if ("_hasAdminPage" in args) {
            args._hasAdminPage = (args._hasAdminPage == 'true' || args._hasAdminPage == true);
        }
        if ("_hasTable" in args) {
            args._hasTable = (args._hasTable == 'true' || args._hasTable == true);
        }
        if (args.contents) args.contents = _.uniq(args.contents ? args.contents.split(",") : []);
        let result = Model.update("pages", "id", args);
        if (args.title !== result.title) pageExt.update(result.value());
        return result;
    }
    static delete(args) {
        let result = Model.findBy("pages", args);
        Model.delete("pages", {
            parentId: result.id
        });
        pageExt.destroy(result);
        return Model.delete("pages", args);
    }
}