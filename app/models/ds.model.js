/*############################################################################
# 
# Module: ds.model.js
#
# Description:
#     DB Schema for Data Source Collection
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
#     V2.0.0 Fri April 29 2023 15:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    dsname: String,
    dsid: String,
    dburl: String,
    dbname: String,
    mmtname: String,
    uname: String,
    pwd: String,
    user: String
}, {
    timestamps: true
});

module.exports = mongoose.model('dsrc', NoteSchema);