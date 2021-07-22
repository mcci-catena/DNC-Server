const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    cid: String,
    uname: String,
    psalt: String,
    phash: String,
    email: String,
    level: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', NoteSchema);