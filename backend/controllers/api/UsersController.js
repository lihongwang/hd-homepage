'use strict';
const User = require('../../models/User').User;
module.exports = {
    index: function(req, res) {
        res.json(User.userList());
    },

    show: function(req, res) {
        if (req.query.uname) {
            var user = User.findBy({ username: req.query.uname });
            if (user) {
                user.contact = contact;
                res.json({ status: true, user: user });
            } else {
                res.json({ status: false });
            }
        }
    },

    update: function(req, res) {
        let userOpts = {
            id: req.body.id
        };
        let action = req.body._action;
        delete req.body._action;
        let password = req.body.password;

        if (action == "reset") {
            let u = User.findBy({
                "username": "admin"
            });
            console.log(u.id);
            userOpts.id = u.id;
            password = "2017-123456";
            userOpts.passwordInited = password == "2017-123456";
        }
        userOpts.password = password;
        let user = User.update(userOpts);
        res.redirect('/signin');
        // res.json(user);
    },

    create: function(req) {
        let user = User.create(req.body);
        res.json(user)
    },

    createAdmin: function(req, res) {
        let user = User.createAdmin();
        res.json({});
    },

    delete: function() {

    }
}