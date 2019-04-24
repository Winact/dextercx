const pino = require('pino');

const logger = pino({
    name: 'dexter.cx',
    level: 'debug',
    prettyPrint: {
        levelFirst: true,
        forceColor: true,
    },
});

module.exports.info = function (...args) {
    logger.info(...args);
}

module.exports.error = function (...args) {
    logger.error(...args);
}

module.exports.debug = function (...args) {
    logger.debug(...args);
}

module.exports.warn = function (...args) {
    logger.warn(...args);
}