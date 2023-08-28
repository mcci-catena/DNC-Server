/*############################################################################
# 
# Module: location.model.js
#
# Description:
#     DB Schema for Location Collection
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
#     V2.0.0 Mon April 24 2023 12:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    sid: String,
    sname: String,
    latitude: String,
    longitude: String,
    orgid: String,
    technology: String,
    network: String,
    model: String,
    installedOn: Date,
    removedOn: Date,
    lastUpdtOn: Date,
    status: String,
    user: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Spot', NoteSchema);