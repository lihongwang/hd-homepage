'use strict';
const Content = require('../../models/Content').Content;
const parse = require('../../helpers/parseList').parse;
const _ = require('lodash');
const ctrlJson = require("./controllers.json");
const Category = require('../../models/Category').Category;
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "desc";
        req.query.sort = req.query.sort || "updatedAt";
        parse("contents", req, res, ["name"]);
    },

    select: function(req, res) {
        let contents = Content.findAll({
            type: "main"
        });
        res.json(contents);
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let content = Content.findByReg(opt);
        if (content) {
            res.json(content);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    update: function(req, res) {
        req.body.file = req.file;
        let content = Content.update(req.body);
        res.json({ status: true, result: content });
    },

    create: function(req, res) {
        req.body.file = req.file;
        req.body.uniqName = req.body.name;
        validate(Content, { uniqName: req.body.uniqName }, req, res);
    },

    delete: function(req, res) {
        Content.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Content.importData());
    },

    dynamicPost: function(req, res) {
        let name = req.params.action;
        let catName = "contents_" + name;
        let category = Category.findBy({
            name: catName
        });
        req.body.category = catName;
        req.body.file = req.file;
        req.body.uniqName = req.body.name + "_" + catName;
        validate(Content, { uniqName: req.body.uniqName }, req, res);
    },
    dynamicPublic: function(req, res) {
        let name = req.params.action;
        let catName = "contents_" + name;
        let result = parse("contents", req, res, ["name"], {
            published: true,
            category: catName
        }, true);
        res.json({
            rows: Content.withTemplate(result.chain).value(),
            total: result.total
        });
    }
};

// _(ctrlJson.contents.extralNames).each(function(name) {
//     let catName = "contents_" + name;
//     module.exports[name] = function(req, res) {
//         parse("contents", req, res, ["name"], {
//             category: catName
//         });
//     };
//     module.exports["post_" + name] = function(req, res) {
//         let category = Category.findOrCreate("name", {
//             name: catName,
//             type: "contents",
//             usage: 2
//         });
//         req.body.category = catName;
//         req.body.file = req.file;
//         validate(Content, { uniqName: req.body.name + "_" + catName }, req, res);
//     };
//     module.exports["public_" + name] = function(req, res) {
//         let result = parse("contents", req, res, ["name"], {
//             published: true,
//             category: catName
//         }, true);
//         res.json({
//             rows: Content.withTemplate(result.chain).value(),
//             total: result.total
//         });
//     };
// });