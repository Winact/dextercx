const mongoose = require('mongoose');

module.exports = mongoose.model('shortenedurls', mongoose.Schema({
    longUrl: { type: String, default: "N/A" },
    shortUrl: { type: String, default: "N/A" },
    url: { type: String, default: 'N/A' },
    clicks: { type: Number, default: 0 },
    createdById: { type: String, default: 'N/A' },
    createdAt: { type: Date, default: new Date() }
}, {
    versionKey: false
}));