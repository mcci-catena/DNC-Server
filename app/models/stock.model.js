/*############################################################################
# 
# Module: stock.model.js
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

const NoteSchema = mongoose.Schema({
    hwsl: String,
    dsid: String,
    nwIdV: String,
    nwIdK: String,
    idate: Date,
    odate: Date,
    orgid: String,
    status: String,
    remarks: String,
    userid: String
}, {
    timestamps: true
});

module.exports = mongoose.model('stock', NoteSchema);