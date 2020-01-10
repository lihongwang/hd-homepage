'use strict';
const Post = require('../../models/Post').Post;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
const Category = require('../../models/Category').Category;
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "desc";
        req.query.sort = req.query.sort || "updatedAt";
        parse("posts", req, res, ["title"]);
    },

    select: function(req, res) {
        let posts = Post.findAll({
            type: "main"
        });
        res.json(posts);
    },

    public: function(req, res) {
        let result = parse("posts", req, res, ["title"], {
            published: true
        }, true);
        res.json({
            total: result.total,
            rows: Post.format(result.chain)
        })
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let link = Post.findByReg(opt);
        if (link) {
            res.json(link);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    update: function(req, res) {
        req.body.file = req.file;
        let link = Post.update(req.body);
        res.json({ status: true, result: link });
    },

    create: function(req, res) {
        req.body.file = req.file;
        validate(Post, {}, req, res);
    },

    delete: function(req, res) {
        Post.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    dynamicPost: function(req, res) {
        let name = req.params.action;
        let catName = "posts_" + name;
        let category = Category.findBy({
            name: catName
        });
        req.body.category = catName;
        req.body.file = req.file;
        validate(Post, {}, req, res);
    },
    dynamicPublic: function(req, res) {
        let name = req.params.action;
        let catName = "posts_" + name;
        req.query.direction = req.query.direction || "asc";
        req.query.sort = req.query.sort || "position";
        parse("posts", req, res, ["title"], {
            category: catName
        });
    }
}