'use strict';
const path = require('path'),
    app = require('../config/application'),
    Q = require('q'),
    fs = require('fs'),
    jsondb = app.refreshDb(),
    _ = require('lodash'),
    shortid = require('shortid'),
    uploadPath = app.publicPath;
class Model {
    constructor() {
        this.name = "";
    }
    static db(name) {
        let db = app.refreshDb();
        return Model.encodeSrcWithChain(db.get(name));
    }
    static encodeSrcWithChain(chain) {
        return chain.map(function(p) {
            let obj = {};
            for (let key in p) {
                if (key == "src") {
                    obj[key] = p[key].replace(p.file.filename, encodeURIComponent(p.file.filename));
                } else {
                    obj[key] = p[key];
                }

            };
            return obj;
        });
    }
    static encodeSrc(result) {
        if (result && result.src) result.src = result.src.replace(result.file.filename, encodeURIComponent(result.file.filename));
    }
    static list(name, sortKey = "id", direction = "asc", chainAble) {
        let results = Model.db(name).sortBy(sortKey);
        if (direction == "desc") results = results.reverse();
        return chainAble ? results : results.value();
    }
    static first(name) {
        return Model.db(name).first().value();
    }
    static last(name) {
        return Model.db(name).last().value();
    }
    static findBy(name, args) {
        return Model.db(name).find(args).value();
    }
    static findAll(name, args) {
        return Model.db(name).filter(function(r) {
            let result = true;
            for (let key in args) {
                result = result && r[key] == args[key];
            }
            return result;
        }).value();
    }
    static format(chain) {
        return chain;
    }
    static findByReg(name, args) {
        return Model.db(name).filter(function(r) {
            let result = true;
            for (let key in args) {
                if (!args[key]) result = false;
                let reg = new RegExp(args[key], "i");
                result = result && r[key].length == args[key].length && r[key].match(reg);
            }
            return result;
        }).value();
    }

    static where(name, key, value, chainAble) {
        let chain = Model.db(name).filter(function(r) {
            return _.includes(value, r[key]);
        });
        if (chainAble) {
            return chain;
        } else {
            return chain.value();
        }
    }

    static create(name, args) {
        let db = app.refreshDb();
        args.id = shortid.generate();
        args.createdAt = new Date();
        args.updatedAt = new Date();
        if ("published" in args) {
            args.published = (args.published == 'true' || args.published == true);
        }
        if (args.file && args.file.path) {
            args.file.path = args.file.path.replace(uploadPath, "");
            args.src = args.file.path;
        }
        let result = db.get(name).push(args).last().write();
        Model.encodeSrc(result);
        return result;
    }
    static findOrCreate(name, key, args) {
        let db = app.refreshDb();
        let query = {};
        query[key] = args[key];
        if ("published" in args) {
            args.published = (args.published == 'true' || args.published == true);
        }
        let result = db.get(name).find(query).value();
        if (!result) {
            args.id = shortid.generate();
            args.createdAt = new Date();
            args.updatedAt = new Date();
            if (args.file && args.file.path) {
                args.file.path = args.file.path.replace(uploadPath, "");
                args.src = args.file.path;
            }
            result = Model.create(name, args);
        }
        Model.encodeSrc(result);
        return result;
    }
    static update(name, queryKey, args) {
        let db = app.refreshDb();
        let opt = {};
        opt[queryKey] = args[queryKey];
        args.updatedAt = new Date();
        if ("published" in args) {
            args.published = (args.published == 'true' || args.published == true);
        }
        let result = db.get(name).find(opt);
        if (!result.value()) {
            console.log(queryKey + "!!!! record not found!!!!! " + opt[queryKey]);
            return {};
        }
        if (result.value() && args.file && args.file.path) {
            let file = result.value().file;
            if (file && file.path) {
                let fPath = path.join(uploadPath, file.path);
                if (fs.existsSync(fPath)) fs.unlinkSync(fPath);
            }
            args.file.path = args.file.path.replace(uploadPath, "");
            args.src = args.file.path;
        } else {
            args.file = result.value().file;
        }
        result.assign(args).write();
        Model.encodeSrc(result);
        return result;
    }
    static delete(name, args = {}) {
        let db = app.refreshDb(),
            result = db.get(name).find(args);
        if (result.value()) {
            let file = result.value().file;
            if (file && file.path) {
                let fPath = path.join(uploadPath, file.path);
                if (fs.existsSync(fPath)) fs.unlinkSync(fPath);
            }
        }
        result = db.get(name).remove(args).write();
        return result;
    }
    static size(name) {
        let result = Model.db(name).size().value();
        return result;
    }
};
exports.Model = Model;