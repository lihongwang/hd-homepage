'use strict';
const _ = require('lodash');
const Model = require("../../models/_Base").Model;
const Site = require('../../models/Site').Site;
const parse = require('../../helpers/parseList').parse;
const Page = require('../../models/Page').Page;
const pageExt = require("../../../tools/page");
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        parse("sites", req, res, ["name"]);
    },

    select: function(req, res) {
        let sites = Site.findAll({
            type: "main"
        });
        res.json(sites);
    },

    show: function(req, res) {
        let site = Site.first();
        if (site) {
            res.json(site);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    config: function(req, res) {
        let site = Site.first();
        let config = pageExt.parse();
        res.json({
            site: site,
            routes: config.routes,
            config: config
        });
        // routes: Page.homePage(Page.public(Page.mains(true))),
    },

    admin: function(req, res) {
        res.json(pageExt.parse("admin"));
    },

    update: function(req, res) {
        req.body.file = req.file;
        let site = Site.update(req.body).value();
        res.json({
            status: true,
            result: {
                site: site
            }
        });
    },

    create: function(req, res) {
        req.body.file = req.file;
        let site = Site.first();
        validate(Site, { name: req.body.name }, req, res);
    },

    delete: function(req, res) {
        Site.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Site.importData());
    }
}