/*############################################################################
# 
# Module: turl.model.js
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
#     V2.0.0 Wed March 29 2023 15:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    email: String,
    expires: Date,
    url: String,
    fcode: String,
    role: String,
    used: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('Turl', NoteSchema);