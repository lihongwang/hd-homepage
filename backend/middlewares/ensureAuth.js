function ensureAuthenticated(req, res, next) {
    console.log("!!!!!!!!");
    if (req.isAuthenticated()) { return next(); }
    if (req.method == "POST") {
        res.json({ status: false, auth: true, msg: "please login!" });
    } else {
        req.session.backURL = req.header('Referer') || '/admin';
        console.log("@@@@@@@@@@@@@@@@@");
        console.log(req.session.backURL);
        res.redirect('/signin');
    }
}

module.exports = ensureAuthenticated;