const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    cid: String,
    uname: String,
    psalt: String,
    phash: String,
    email: String,
    level: String,
	obsolete: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', NoteSchema);