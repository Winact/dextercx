const router = require('express').Router();

const logger = require('../util/logger');

const ShortenedUrl = require('../models/ShortenedURL');

router.get('/:id', async (req, res) => {
    const urlId = req.params.id;
    if (!urlId) return res.redirect('/');

    const alreadyExists = await ShortenedUrl.findOne({ shortUrl: urlId });
    if (!alreadyExists) return res.redirect('/');

    alreadyExists.clicks = alreadyExists.clicks + +1;
    alreadyExists.save().then(() => {
    	return res.redirect(alreadyExists.longUrl);
    }).catch((e) => {
		logger.error(e);
		return res.redirect('/')
    })
});

module.exports = router;