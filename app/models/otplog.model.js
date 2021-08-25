const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    email: String,
    otp: Number,
    isVerified: String
}, {
    timestamps: true
});

module.exports = mongoose.model('otplogs', NoteSchema);