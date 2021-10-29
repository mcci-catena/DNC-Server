/*############################################################################
# 
# Module: client.model.js
#
# Description:
#     DB Schema for Admin Email Config Collection
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
    email: String,
    org: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Config', NoteSchema);