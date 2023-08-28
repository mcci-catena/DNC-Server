const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    sln: String,
    aurl: String,
    akey: String,
    apisf: String,
    nwidpf: String
}, {
    timestamps: true
});

module.exports = mongoose.model('capi', NoteSchema);