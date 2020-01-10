'use strict';
const _ = require('lodash');
const Page = require('../../models/Page').Page;
const parse = require('../../helpers/parseList').parse;
const pageExt = require("../../../tools/page");
const validate = require('../../helpers/validation').validate;
const ctrlJson = require("./controllers.json");
const Category = require('../../models/Category').Category;
const Model = require("../../models/_Base").Model;
const Content = require('../../models/Content').Content;
const Template = require('../../models/Template').Template;
const mixin = require('mixin-object');
module.exports = {
    index: function(req, res) {
        req.query.direction = req.query.direction || "asc";
        req.query.sort = req.query.sort || "position";
        parse("pages", req, res, ["name"]);
    },
    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let page = Page.findByReg(opt)[0];
        if (!page) return res.json({ status: false, msg: "no results!" });
        let subs = Page.where("id", page.subs);
        let _contents = [];
        _(page.contents).each(function(id) {
            let c = Content.findBy({ id: id });
            if (c) {
                let obj = {
                    id: c.id,
                    src: c.src,
                    template: Template.findBy({
                        id: c.templateId
                    }),
                    name: c.name
                };
                if (c.sub) {
                    obj.sub = c.sub
                }
                _contents.push(obj);
            }
        });
        if (page) {
            res.json({
                page: page,
                subs: subs,
                contents: _contents
            });
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    public: function(req, res) {
        let result = parse("pages", req, res, ["name", "type"], {
            published: true
        }, true);
        res.json({
            total: result.total,
            rows: Page.format(result.chain)
        })
    },

    select: function(req, res) {
        let pages = Page.findAll({
            category: "pages_main"
        });
        res.json(pages);
    },

    subSelect: function(req, res) {
        let pages = Page.findAll({
            category: "pages_sub"
        });
        res.json(pages);
    },

    config: function(req, res) {
        res.json(pageExt.parse().routes);
        // let routes = pageExt.parse().routes;
        // let _routes = {};
        // Page.where("category", "pages_main", true).filter(function(_p) {
        //     return !_p.hide;
        // }).sortBy(function(element) {
        //     return _.get(element, "positon");
        // }).each(function(p) {
        //     _routes[p.name] = mixin({
        //         position: p.position
        //     }, routes[p.name]);
        //     Page.where("id", p.subs, true).filter(function(_s) {
        //         return !_s.hide;
        //     }).sortBy(function(ele) {
        //         return _.get(ele, "positon");
        //     }).each(function(sub) {
        //         _routes[sub.name] = mixin({
        //             position: sub.position
        //         }, routes[sub.name]);
        //     });
        // });;
        // res.json(_routes);
    },

    update: function(req, res) {
        req.body.file = req.file;
        let page = Page.update(req.body);
        res.json({ status: true, result: page });
    },

    create: function(req, res) {
        req.body.file = req.file;
        req.body.uniqName = req.body.name;
        validate(Page, { uniqName: req.body.uniqName }, req, res);
    },

    delete: function(req, res) {
        Page.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    },

    import: function(req, res) {
        res.json(Page.importData());
    },

    dynamicPost: function(req, res) {
        let name = req.params.action;
        let catName = "pages_" + name;
        let category = Category.findBy({
            name: catName
        });
        req.body.category = catName;
        req.body.file = req.file;
        req.body.uniqName = req.body.name + "_" + catName;
        validate(Page, { uniqName: req.body.uniqName }, req, res);
    },
    dynamicPublic: function(req, res) {
        let name = req.params.action;
        let catName = "pages_" + name;
        req.query.direction = req.query.direction || "asc";
        req.query.sort = req.query.sort || "position";
        parse("pages", req, res, ["name"], {
            category: catName
        });
    }
}

// _(ctrlJson.pages.extralNames).each(function(name) {
//     let catName = "pages_" + name;
//     module.exports[name] = function(req, res) {
//         parse("pages", req, res, ["name"], {
//             category: catName
//         });
//     };
//     module.exports["post_" + name] = function(req, res) {
//         let category = Category.findOrCreate("name", {
//             name: catName,
//             type: "pages",
//             usage: 2
//         });
//         req.body.category = catName;
//         req.body.file = req.file;
//         validate(Page, { uniqName: req.body.name + "_" + catName }, req, res);
//     };
//     module.exports["public_" + name] = function(req, res) {
//         req.query.direction = req.query.direction || "asc";
//         req.query.sort = req.query.sort || "position";
//         parse("pages", req, res, ["name"], {
//             category: catName
//         });
//     };
// });