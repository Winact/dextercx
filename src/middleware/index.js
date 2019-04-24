const config = require('../config.json');

var middlewareObj = {};

middlewareObj.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

middlewareObj.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user && config.site.adminDiscordIds.includes(req.user.id)) return next();
    res.redirect('/');
}

module.exports = middlewareObj;