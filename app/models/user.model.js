/*############################################################################
# 
# Module: user.model.js
#
# Description:
#     DB Schema for User Collection
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
#     V2.0.0 Wed MArch 29 2023 15:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    uid: String,
    name: String,
    email: String,
    firstName: String,
    lastName: String,
    role: String,
    psalt: String,
    phash: String,
    status: String,
    obsolete: Boolean,
    firstLogin: Date,
    validtill: Date,
    lastLogin: {"login": Date, "logout": Date}
}, {
    timestamps: true
});

module.exports = mongoose.model('Users', NoteSchema);