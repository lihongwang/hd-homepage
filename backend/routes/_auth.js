const passport = require('passport'),
    path = require('path');

module.exports = function(app, ensureAuthenticated) {
    app.post('/registry', passport.authenticate('local-signup'), function(req, res) {
        let result = req.result
        if (result.status) {
            let user = result.user;
            console.log("REGISTERED: " + user.username);
            res.json({ status: true, msg: result.msg });
        } else {
            console.log("COULD NOT REGISTER");
            //inform user could not log them in
            res.json({ status: false, msg: result.msg });
        }
    });

    app.get('/reset_password', passport.authenticate('local-signup'), function(req, res) {
        let user = req.user;
        if (user) {
            console.log("REGISTERED: " + user.username);
            res.json({ status: true, msg: 'Successful created new user.' });
        }
        if (!user) {
            console.log("COULD NOT REGISTER");
            //inform user could not log them in
            res.json({ status: false, msg: 'That username is already in use, please try a different one.' });
        }
    });

    //sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
    // app.post('/login', passport.authenticate('local-signin', {
    //     successRedirect: '/admin',
    //     failureRedirect: '/signin'
    // }));

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-signin', function(err, user, info) {
            if (err) { return res.redirect("/signin") }
            if (!user) { return res.redirect("/signin") }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                console.log(req.session.backURL);
                res.redirect(req.session.backURL || "/admin");
            });
        })(req, res, next);
    });

    app.get('/signin', function(req, res, next) {
        res.render('signin', { layout: null });
    });
    app.get('/password/reset', ensureAuthenticated, function(req, res, next) {
        res.render('password', { layout: null, isSuperAdmin: req.user.isSuperAdmin, userId: req.user.id });
    });
    //logs user out of site, deleting them from the session, and returns to homepage
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
        req.session.notice = "You have successfully been logged out!";
    });
    app.get('/api/auth/check', function(req, res) {
        if (req.isAuthenticated()) {
            res.json({ status: true, auth: true });
        } else {
            res.json({ status: false, auth: true });
        }
    });
};