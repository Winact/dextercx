const express = require('express');
const flash = require('express-flash');
const app = express();
const handlebars = require('express-handlebars');
const handlebarsSections = require('express-handlebars-sections');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const { Strategy } = require('passport-discord');
const passport = require('passport');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const config = require('./config.json');
const logger = require('./util/logger');
const socket = require('./socket.js');

const apiRoute = require('./routes/api');
const authRoute = require('./routes/auth');
const pagesRoute = require('./routes/pages');
const goRoute = require('./routes/go');
const iRoute = require('./routes/i');

if (!fs.existsSync(`./uploads`)) fs.mkdirSync(`./uploads`);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new Strategy({
    clientID: config.discordPassport.clientId,
    clientSecret: config.discordPassport.clientSecret,
    callbackURL: config.discordPassport.callbackUrl,
    scope: ['identify']
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

app.use(session({
    secret: config.site.session.secret,
    resave: false,
    saveUninitialized: true
}));

app.use(fileUpload({
    safeFileNames: true,
    preserveExtension: true
}));

app.engine('handlebars', handlebars({ defaultLayout: 'main', helpers: { section: handlebarsSections() } }));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', pagesRoute);
app.use('/i', iRoute);
app.use('/go', goRoute);
app.use('/api', apiRoute);
app.use('/auth', authRoute);

app.listen(config.site.port, () => {
    logger.info(`[API] Listening on port ${config.site.port}`);
    mongoose.connect(`mongodb://${config.database.username}:${config.database.password}@${config.database.url}:${config.database.port}/${config.database.db}`, { useNewUrlParser: true });
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        process.exit(0)
    });
});