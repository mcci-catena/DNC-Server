const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    uname: String,
    email: String,
    otp: Number,
    isVerified: String,
    expiryTime: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('otplogs', NoteSchema);
