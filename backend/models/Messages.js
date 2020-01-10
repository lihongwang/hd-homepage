'use strict';
const Model = require("./_Base").Model,
    path = require('path'),
    _ = require('lodash'),
    app = require('../config/application'),
    quicksend = require('../mail/quick-send'),
    fs = require('fs');

exports.Messages = class Messages extends Model {
    static list(sortKey = "updatedAt", direction = "asc") {
        return Model.list("messages", sortKey, direction);
    }
    static findBy(args) {
        return Model.findBy("messages", args);
    }
    static findAll(args) {
        return Model.findAll("messages", args);
    }
    static findByReg(args) {
        return Model.findByReg("messages", args);
    }
    static where(key, value, chainAble) {
        return Model.where("messages", key, value, chainAble);
    }
    static format(chain, keys) {
        if (keys) {
            return chain.map(function(p) {
                let obj = {};
                keys.forEach(function(key) {
                    obj[key] = p[key];
                });
                return obj;
            });
        } else {
            return chain.map(function(p) {
                return {
                    id: p.id
                };
            });
        }
    }
    static create(args) {
        let result = Model.create("messages", args);
        quicksend({
            body: result.content,
            data: result,
            from: result.email,
            to: app.contactMail,
            subject: '提交需求'
        }).then(function() {
            console.log('mail has been sent');
        }).catch(function(e) {
            console.log('mail send failed');
            console.log(e.stack);
        });
        quicksend({
            filename: 'return',
            data: result,
            to: result.email,
            from: app.contactMail,
            subject: '需求提交-回送邮件'
        }).then(function() {
            console.log('mail has been sent');
        }).catch(function(e) {
            console.log('mail send failed');
            console.log(e.stack);
        });
        return result;
    }
    static update(args) {
        return Model.update("messages", "id", args);
    }
    static delete(args) {
        return Model.delete("messages", args);
    }
}