const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    email: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Config', NoteSchema);