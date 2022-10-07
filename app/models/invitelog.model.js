/*############################################################################
# 
# Module: emotp.model.js
#
# Description:
#     DB Schema for OTP handling Collection
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
#     V1.3.0 Thu Oct 06 2022 11:24:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    cname: String,
    email: String,
    isAdmin: Boolean, 
    isUsed: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('invitelogs', NoteSchema);