'use strict';
const Messages = require('../../models/Messages').Messages;
const parse = require('../../helpers/parseList').parse;
const validate = require('../../helpers/validation').validate;
module.exports = {
    index: function(req, res) {
        parse("messages", req, res, ["title"]);
    },

    show: function(req, res) {
        let opt = {};
        opt[req.query.key] = req.query.value;
        let messages = Messages.findByReg(opt);
        if (messages) {
            res.json(messages);
        } else {
            res.json({ status: false, msg: "no results!" });
        }
    },

    send: function(req, res) {
        validate(Messages, {}, req, res);
    },

    update: function(req, res) {
        req.body.file = req.file;
        let messages = Messages.update(req.body);
        res.json({ status: true, result: messages });
    },

    create: function(req, res) {
        req.body.file = req.file;
        validate(Messages, {}, req, res);
    },

    delete: function(req, res) {
        Messages.delete(req.body);
        res.json({ status: true, msg: "删除成功！" });
    }
}