/*############################################################################
# 
# Module: client.model.js
#
# Description:
#     DB Schema for Client Collection
#
# Copyright notice:
#     This file copyright (c) 2021 by
#
#         MCCI Corporation
#         3520 Krums Corners Road
#         Ithaca, NY  14850
#
#     Released under the MCCI Corporation.
#
# Author:
#     Seenivasan V, MCCI Corporation February 2021
#
# Revision history:
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

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