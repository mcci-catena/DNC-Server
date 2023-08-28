/*############################################################################
# 
# Module: org.model.js
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
#     V2.0.0 Mon April 17 2023 11:10:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    id: String,
    name: String,
    users: [String],
    devices: [String],
    tags: [String],
    gateways: [String],
    locations: [String],
    grafanalink: String,
    date: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Org', NoteSchema);