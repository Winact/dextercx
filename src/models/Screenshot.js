const mongoose = require('mongoose');

module.exports = mongoose.model('screenshots', mongoose.Schema({
    id: { type: String, default: "N/A" },
    url: { type: String, default: "N/A" },
    filesize: { type: String, default: "N/A" },
    deleted: { type: Boolean, default: false },
    uploadedById: { type: String, default: "N/A" },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: new Date() }
}, {
    versionKey: false
}));