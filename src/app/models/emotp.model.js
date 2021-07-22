const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    uname: String,
    email: String,
    otpsalt: String,
    otphash: String,
    function: String,
    status: String,
    tvalid: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('emotps', NoteSchema);