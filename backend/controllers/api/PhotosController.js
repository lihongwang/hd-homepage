'use strict';
const Photo = require('../../models/Photo').Photo;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
const Category = require('../../models/Category').Category;
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "desc";
        req.query.sort = req.query.sort || "updatedAt";
        parse("photos", req, res, ["name"]);
    },

    select: function(req, res) {
        let photos = Photo.findAll({
            type: "main"
        });
        res.json(photos);
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let link = Photo.findByReg(opt);
        if (link) {
            res.json(link);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    public: function(req, res) {
        let result = parse("photos", req, res, ["name"], {
            published: true
        }, true);
        res.json({
            total: result.total,
            rows: Photo.format(result.chain)
        })
    },

    update: function(req, res) {
        req.body.file = req.file;
        let link = Photo.update(req.body);
        res.json({ status: true, result: link });
    },

    create: function(req, res) {
        req.body.file = req.file;
        req.body.uniqName = req.body.name;
        validate(Photo, { uniqName: req.body.name }, req, res);
    },

    delete: function(req, res) {
        Photo.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    dynamicPost: function(req, res) {
        let name = req.params.action;
        let catName = "photos_" + name;
        let category = Category.findBy({
            name: catName
        });
        req.body.category = catName;
        req.body.file = req.file;
        req.body.uniqName = req.body.name + "_" + catName;
        validate(Photo, {
            uniqName: req.body.uniqName
        }, req, res);
    },
    dynamicPublic: function(req, res) {
        let name = req.params.action;
        let catName = "photos_" + name;
        req.query.direction = req.query.direction || "asc";
        req.query.sort = req.query.sort || "position";
        parse("photos", req, res, ["name"], {
            category: catName
        });
    }
}