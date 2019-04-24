const router = require('express').Router();
const fs = require('fs');

const logger = require('../util/logger');

const Screenshots = require('../models/Screenshot');

router.get('/:file', async (req, res) => {
    const file = req.params.file;

    Screenshots.findOne({ id: file.split('.')[0], deleted: false }, (err, result) => {
        if (err) {
            logger.error(err)
            return res.redirect('/')
        };

        if (!result) return res.redirect('/');

        result.views = result.views + +1;
        result.save().then(() => {
            fs.readFile(`./uploads/${file}`, (error, image) => {
                if (error) return res.redirect('/');

                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.end(image, 'binary');
            });
        }).catch((e) => {
        logger.error(e);
        return res.redirect('/')
    })
    })
});

module.exports = router;