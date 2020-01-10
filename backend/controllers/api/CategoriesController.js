'use strict';
const Category = require('../../models/Category').Category;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        parse("categories", req, res, ["name"], {
            type: "categories"
        });
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let cat = Category.findByReg(opt);
        if (cat) {
            res.json(cat);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    select: function(req, res) {
        let cats = Category.findAll({ "_contentSelectable": true });
        res.json(cats);
    },

    update: function(req, res) {
        req.body.file = req.file;
        let cat = Category.update(req.body);
        res.json({ status: true, result: cat });
    },

    create: function(req, res) {
        req.body.file = req.file;
        req.body.type = "categories";
        req.body.usage = 1;
        validate(Category, { name: req.body.name }, req, res);
    },

    delete: function(req, res) {
        Category.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Category.importData());
    },

    dynamicPost: function(req, res) {
        let name = req.params.action;
        req.body.category = name;
        req.type = name;
        req.body.file = req.file;
        req.body.usage = 2;
        req.body.name = name + "-" + req.body.name;
        validate(Category, { name: req.body.name }, req, res);
    },
    dynamicPublic: function(req, res) {
        let name = req.params.action;
        req.query.direction = req.query.direction || "asc";
        req.query.sort = req.query.sort || "position";
        let result = parse("categories", req, res, ["name"], {
            category: name
        }, true);
        res.json({
            total: result.total,
            rows: result.chain.value()
        })
    }
}