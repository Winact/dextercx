const router = require('express').Router();
const middleware = require('../middleware');
const logger = require('../util/logger');
const config = require('../config.json');
const path = require('path');
const randomstring = require('randomstring');
const fs = require('fs');

const { getFilesizeInBytes } = require('../util/utils');
const io = require('../socket');

const Screenshot = require('../models/Screenshot');
const ShortenedUrl = require('../models/ShortenedURL');
const User = require('../models/User');

router.post('/shorten', middleware.isAuthenticated, middleware.isAdmin, async (req, res) => {
    const postData = req.body;    

    if (!postData.url) {
        req.flash("error", "Long URL field is empty.");
        return res.redirect('/dashboard');
    } else {
        const expression = '(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})';
        const urlRegex = new RegExp(expression);

        if (!postData.short) {
            postData.short = randomstring.generate(6)
        }

        if (!postData.url.match(urlRegex)) {
            req.flash("error", "The url provided is not a valid url.");
            return res.redirect('/dashboard');
        }

        const alreadyExists = await ShortenedUrl.findOne({ shortUrl: postData.short });

        if (alreadyExists) {
            req.flash("error", "A shortened link with the short url already exists.");
            return res.redirect('/dashboard');
        } else if (!alreadyExists) {
            const newUrl = new ShortenedUrl({
                longUrl: postData.url,
                shortUrl: postData.short,
                url: `${config.site.shortUrlEndpoint}/${postData.short}`,
                createdById: req.user.id
            });

            newUrl.save().then(data => {
                req.flash('success', `Created URL - ${data.url}`);
                res.redirect('/dashboard');
            }).catch(e => {
                req.flash("error", "Unexpected error when saving to database.");
                return res.redirect('/dashboard');
            });
        }
    }
});

router.post('/upload', async (req, res) => {
    if (!req.headers.authorization) return res.json({ success: false, error: "missing_headers" });
    const userData = await User.findOne({ token: req.headers.authorization });

    if (!userData || !config.site.adminDiscordIds.includes(userData.id)) return res.json({ success: false, error: "not_authenticated" });
    if (!req.files.file) return res.json({ success: false, error: "no_file" });

    const file = req.files.file;
    const fileExtension = path.extname(file.name);
    const fileNewName = randomstring.generate(7) + fileExtension;

    file.mv("./uploads/" + fileNewName, function (err) {
        if (err) {
            logger.error(err)
            return res.json({ success: false, error: "error_uploading_file" });
        }

        const newSs = new Screenshot({
            id: fileNewName.replace(fileExtension, ''),
            filesize: getFilesizeInBytes(fs.statSync("./uploads/" + fileNewName).size),
            url: `${config.site.screenshotUrlEndpoint}/${fileNewName}`,
            uploadedById: userData.id
        });

        newSs.save().then(data => {

            if (userData.socketId) {
                io.to(userData.socketId).emit('imageUploads', {
                    id: fileNewName.replace(fileExtension, ''), url: `${config.site.screenshotUrlEndpoint}/${fileNewName}`
                })
            }

            return res.json({ success: true, url: data.url, delete_url: config.site.screenshotDeleteEndpoint + `/${data.id}`});
        }).catch(e => {
            logger.error(e);
            return res.json({ success: false, error: "error_inseting_data" })
        })

    });
});

router.get('/shorten/delete/:id', middleware.isAuthenticated, middleware.isAdmin, async (req, res) => {
    const urlId = req.params.id;
    const urlData = await ShortenedUrl.findOne({ shortUrl: urlId });

    if (!urlData) {
        req.flash('error', 'Invalid url.');
        return res.redirect('/dashboard');
    }

    if (!urlData.createdById === req.user.id) {
        req.flash('error', 'Short url doesnt belong to you.');
        return res.redirect('/dashboard');
    }

    urlData.delete().then(data => {
        req.flash('success', `Deleted shortened url ${data.shortUrl}.`);
        return res.redirect('/dashboard');
    }).catch(e => {
        logger.error(e);
        req.flash('error', 'Error deleting shortened url.');
        return res.redirect('/dashboard');
    })
});

router.get('/delete/:id', middleware.isAuthenticated, middleware.isAdmin, async (req, res) => {
    const screenshotId = req.params.id;
    const screenshotData = await Screenshot.findOne({ id: screenshotId, deleted: false });

    if (!screenshotData) {
        req.flash('error', 'Invalid screenshot.');
        return res.redirect('/dashboard');
    }

    if (!screenshotData.uploadedById === req.user.id) {
        req.flash('error', 'Screenshot doesnt belong to you.');
        return res.redirect('/dashboard');
    }

    const screenshotFileName = screenshotData.url.replace(config.site.screenshotUrlEndpoint + "/", "");

    fs.unlink(`./uploads/${screenshotFileName}`, (err) => {
        if (err) {
            req.flash('error', 'Error deleting screenshot file.');
            return res.redirect('/dashboard');
        }

        screenshotData.deleted = true;

        screenshotData.save().then(data => {
            req.flash('success', `Deleted screenshot ${data.id}.`);
            return res.redirect('/dashboard');
        }).catch(e => {
            logger.error(e);
            req.flash('error', 'Error deleting screenshot file.');
            return res.redirect('/dashboard');
        })
    });
});

router.get('/token/reset', middleware.isAuthenticated, middleware.isAdmin, async (req, res) => {
    const userData = await User.findOne({ id: req.user.id });
    const newToken = randomstring.generate(64);

    if (!userData || !userData.token) {
        req.flash('error', 'Couldn\'t find token in database document.');
        return res.redirect('/dashboard');
    }

    userData.token = newToken;

    userData.save().then(data => {
        req.flash('success', `Token successfully reset, make sure to update your authorization headers.`);
        return res.redirect('/dashboard');
    }).catch(e => {
        logger.error(e);
        req.flash('error', 'Error resetting token.');
        return res.redirect('/dashboard');
    })
});

module.exports = router;