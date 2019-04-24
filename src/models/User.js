const mongoose = require('mongoose');

module.exports = mongoose.model('users', mongoose.Schema({
    id: { type: String, default: "N/A" },
    token: { type: String, default: "N/A"},
    socketId: { type: String, default: null },
    createdAt: { type: Date, default: new Date() }
}, {
    versionKey: false
}));