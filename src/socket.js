const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const config = require('./config.json');

const logger = require('./util/logger');
const User = require('./models/User');

require('socketio-auth')(io, {
    authenticate: function (socket, data, callback) {        
        User.findOne({ token: data.token }, (err, result) => {
            if (!data.token || err || !result) return callback(new Error("User not found"));
            
            result.socketId = socket.id;

            result.save().then((data) => {
                return callback(null, data);
            }).catch(logger.error);
        });
    }
});

app.get('/', (req, res) => res.json({ success: true }));

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        if (!socket.id) return;
        User.findOne({ socketId: socket.id }, (err, result) => {
            if (!result || err) return;
            result.socketId = null;

            result.save().catch(logger.error);
        });
    })
});

http.listen(config.websocket.port, () => {
    logger.info(`[WS]  Listening on port ${config.websocket.port}`);
    mongoose.connect(`mongodb://${config.database.username}:${config.database.password}@${config.database.url}:${config.database.port}/${config.database.db}`, { useNewUrlParser: true });
});

module.exports = io;