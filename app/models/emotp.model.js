const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    uname: String,
    email: String,
    otpsalt: String,
    otphash: String,
    functionMode: String,
    status: String,
    tvalid: Date
}, {
    timestamps: true
});

NoteSchema.index( { "tvalid": 1 }, { expireAfterSeconds: 300 } );

module.exports = mongoose.model('emotps', NoteSchema);