const router = require('express').Router();
const passport = require('passport');
const randomstring = require('randomstring');

const logger = require('../util/logger');
const config = require('../config.json');

const User = require('../models/User');

router.get('/login', passport.authenticate('discord'));

router.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), async (req, res) => {
    const alreadyExists = await User.findOne({ id: req.user.id });

   if (!alreadyExists && config.site.adminDiscordIds.includes(req.user.id)) {
        const token = randomstring.generate(64);
        const newUser = new User({ id: req.user.id, token });

        newUser.save().catch(e => {
            logger.error(e);
            return res.redirect('/')
        });
   }

    req.flash("success", `Authenticated as ${req.user.username}`)
    res.redirect('/dashboard')
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
});

module.exports = router;