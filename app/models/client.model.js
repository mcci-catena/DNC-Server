const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    cname: String,
    cid: String,
    dbdata: {url: String, user: String, pwd: String, dbname: String, mmtname: String},
    taglist: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Clients', NoteSchema);