/*############################################################################
# 
# Module: ssu.model.js
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
#     V2.0.0 Fri April 29 2023 15:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const SsuSchema = mongoose.Schema({
    batch: String,
    ssuid: String,
    ssutype: String,
    ssuver: String,
    ssustatus: String,
    client: String,
    location: String,
    adate: Date,
    remarks: String,
    userid: String
}, {
    timestamps: true
});

module.exports = mongoose.model('ssumr', SsuSchema);