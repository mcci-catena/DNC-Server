/*############################################################################
# 
# Module: gateway.model.js
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
#     V2.0.0 Fri April 11 2023 15:01:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    gwid: String,
    name: String,
    hwid: String,
    simmk: String,
    orgid: String,
    location: String,
    ssusc: String,
    tech: String,
    network: String,
    model: String,
    status: String,
    lactive: Date,
    remarks: String,
    adate: Date,
    userid: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Gwmr', NoteSchema);