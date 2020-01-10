'use strict';
const _ = require('lodash'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    fs = require('fs'),
    multer = require('multer'),
    replacestream = require('replacestream');
let initHandler = function(rootDir, contextPath) {
    return (req, res) => {
        let html = path.join(rootDir, "index.html");
        res.setHeader('content-type', 'text/html');
        let replacement = `</title><base href="${contextPath}/">`;
        fs.createReadStream(html).pipe(replacestream('</title>', replacement)).pipe(res);
    }
};

let loadItem = function loadItem(app, ensureAuthenticated, key, ctrl) {
    let item = ctrl[key];
    let _app = require('../config/application');
    let __module = require(path.join(_app.backendPath, "controllers", item.module));
    _(["update", "create", "show", "delete", "config", "index", "public", "select"]).each(function(name) {
        if (__module[name]) {
            let matcher = name.match(/^(update|create|delete)/)
            if (matcher) {
                let storage = multer.diskStorage({
                        destination: function(req, file, cb) {
                            let _p = path.join(_app.publicPath, 'upload', item.uploadPath || "");
                            if (!fs.existsSync(_p)) mkdirp.sync(_p);
                            cb(null, _p);
                        },
                        filename: function(req, file, cb) {
                            cb(null, Date.now() + "-" + file.originalname);
                        }
                    }),
                    upload = multer({ storage: storage });
                app.post('/api/' + key + '/' + name, ensureAuthenticated, upload.single('file'), function(req, res) {
                    __module[name](req, res);
                });
            } else {
                app.get('/api/' + key + '/' + name, function(req, res) {
                    __module[name](req, res);
                });
            }

        }
    });

    if (__module.dynamicPost) {
        let storage = multer.diskStorage({
                destination: function(req, file, cb) {
                    let _p = path.join(_app.publicPath, 'upload', req.params.action || "");
                    if (!fs.existsSync(_p)) mkdirp.sync(_p);
                    cb(null, _p);
                },
                filename: function(req, file, cb) {
                    cb(null, Date.now() + "-" + file.originalname);
                }
            }),
            upload = multer({ storage: storage });
        app.post('/api/' + key + '/post/:action', ensureAuthenticated, upload.single('file'), function(req, res) {
            __module.dynamicPost(req, res);
        });
    }
    if (__module.dynamicPublic) {
        app.get('/api/' + key + '/public/:action', function(req, res) {
            __module.dynamicPublic(req, res);
        });
    }
}
let obj = {
    init: function(app, ensureAuthenticated) {
        this.app = app;
        this.ensureAuthenticated = ensureAuthenticated;
        this.addFrontendRoutes(this.parse(), false, {
            contextPath: "",
            rootDir: path.join(__dirname, "../../frontend/src/apps/home/src")
        });
        this.addFrontendRoutes(this.parse("admin"), true, {
            contextPath: "/admin",
            rootDir: path.join(__dirname, "../../frontend/src/apps/admin/src")
        });
    },
    addFrontendRoutes: function(routes, auth, opts) {
        let self = this;
        _.each(routes, (value, key) => {
            let _r = opts.contextPath + value.pathto;
            console.log(_r)
            if (auth) {
                self.app.get(_r, self.ensureAuthenticated, initHandler(opts.rootDir, opts.contextPath));
            } else {
                self.app.get(_r, initHandler(opts.rootDir, opts.contextPath));
            }
        });
    },
    addBackendRoutes: function(key, obj) {
        loadItem(this.app, this.ensureAuthenticated, key, obj);
    },
    parse: function(name, addRoute) {
        name = name || "home";
        let routePath = path.join(__dirname, "../../frontend/src/apps/" + name, "src/routes.json");
        return JSON.parse(fs.readFileSync(routePath, 'utf8'));
    }
};

module.exports = obj;