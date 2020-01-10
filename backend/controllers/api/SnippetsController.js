'use strict';
const Snippet = require('../../models/Snippet').Snippet;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "desc";
        req.query.sort = req.query.sort || "updatedAt";
        parse("snippets", req, res, ["name"]);
    },

    select: function(req, res) {
        let snippets = Snippet.findAll({
            type: "main"
        });
        res.json(snippets);
    },

    public: function(req, res) {
        let result = parse("snippets", req, res, ["title"], {
            published: true
        }, true);
        res.json({
            total: result.total,
            rows: Snippet.format(result.chain)
        })
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let link = Snippet.findByReg(opt);
        if (link) {
            res.json(link);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    update: function(req, res) {
        req.body.file = req.file;
        let link = Snippet.update(req.body);
        res.json({ status: true, result: link });
    },

    create: function(req, res) {
        req.body.file = req.file;
        validate(Snippet, { name: req.body.name }, req, res);
    },

    delete: function(req, res) {
        Snippet.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Snippet.importData());
    }
}