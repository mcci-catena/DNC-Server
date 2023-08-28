/*############################################################################
# 
# Module: dmd.model.js
#
# Description:
#     Controller for Managing Org module
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
#     V2.0.0 Mon July 29 2023 11:15:21 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    hwsl: String,
    boardrev: String,
    fwver: String,
    technology: String,
    network: String,
    region: String,
    remarks: String,
    adate: Date,
    userid: String,
    
}, {
    timestamps: true
});

module.exports = mongoose.model('dmd', NoteSchema);