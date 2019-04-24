const router = require('express').Router();
const middleware = require('../middleware');
const moment = require('moment');

const config = require('../config.json');
const logger = require('../util/logger');

const Screenshots = require('../models/Screenshot');
const ShortenedURL = require('../models/ShortenedURL');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('home', {});
});

router.get('/dashboard', middleware.isAuthenticated, middleware.isAdmin, async (req, res) => {
    const userData = await User.findOne({ id: req.user.id });
    Screenshots.find({ uploadedById: req.user.id, deleted: false }, async (sErr, sResult) => {
        if (sErr) {
            logger.error(sErr)
            req.flash("error", "Error fetching screenshots.")
            return res.redirect('/dashboard')
        };
        
        sResult.sort((a , b) => (a.createdAt < b.createdAt ? 1 : -1));

        ShortenedURL.find({ createdById: req.user.id }, (uErr, uResult) => {
            if (uErr) {
                logger.error(uErr)
                req.flash("error", "Error fetching shortened urls.")
                return res.redirect('/dashboard')
            };

            res.render('dashboard', {
                user: req.user,
                screenshots: sResult,
                shortened: uResult,
                authToken: userData.token,
                config: {
                    websocket: config.site.websocketUrl,
                    delete: config.site.screenshotDeleteEndpoint
                }
            });
        });
    });
});

module.exports = router;