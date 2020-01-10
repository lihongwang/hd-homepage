const bcrypt = require('bcryptjs'),
    request = require('request'),
    path = require('path'),
    User = require('../models/User').User,
    Q = require('q');
exports.localReg = function(args) {
    let deferred = Q.defer();
    let result = User.findBy({
        username: args.username
    });
    if (null != result) {
        console.log("USERNAME ALREADY EXISTS:", result.username);
        deferred.resolve({
            status: false,
            result: {},
            msg: "account:" + result.username + "ALREADY EXISTS"
        }); // username exists
    } else {
        console.log("CREATING USER:", args.username);
        let user = {
            "display": args.display,
            "username": args.username,
            "password": args.password,
            "email": args.email
        };
        User.create(user);
        deferred.resolve({
            status: true,
            user: user,
            msg: "success, please active this account"
        });
    }
    return deferred.promise;
};


//check if user exists
//if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
//if password matches take into website
//if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function(username, password) {
    let deferred = Q.defer();
    let result = User.findBy({
        username: username
    });
    if (null == result) {
        deferred.resolve({
            status: false,
            msg: "USERNAME NOT FOUND:" + username
        });
    } else {
        let hash = result.password;
        console.log("FOUND USER: " + result.username);
        if (bcrypt.compareSync(password, hash)) {
            deferred.resolve({
                status: true,
                user: result
            });
        } else {
            console.log("AUTHENTICATION FAILED");
            deferred.resolve({
                status: false,
                user: null,
                msg: "password or username error, pleace try again！"
            });
        }
    }
    return deferred.promise;
}