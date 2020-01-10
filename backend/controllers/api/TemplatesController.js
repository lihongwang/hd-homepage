'use strict';
const Template = require('../../models/Template').Template;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "desc";
        req.query.sort = req.query.sort || "updatedAt";
        parse("templates", req, res, ["name"]);
    },

    public: function(req, res) {
        let result = parse("templates", req, res, ["title"], {
            published: true
        }, true);
        res.json({
            total: result.total,
            rows: Template.format(result.chain)
        })
    },

    show: function(req, res) {
        let opt = {};
        let tpl;
        if (!req.query.key) {
            tpl = Template.first();
        } else {
            opt[req.query.key] = req.query.value;
            tpl = Template.findByReg(opt);
        }

        if (tpl) {
            res.json(tpl[0]);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    update: function(req, res) {
        req.body.file = req.file;
        let tpl = Template.update(req.body);
        res.json({ status: true, result: tpl });
    },

    create: function(req, res) {
        req.body.file = req.file;
        validate(Template, { name: req.body.name }, req, res);
    },

    delete: function(req, res) {
        Template.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Template.importData());
    }
}