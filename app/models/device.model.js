/*############################################################################
# 
# Module: device.model.js
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
    hwsl: String,           // Device Harware Serial Number
    dsid: String,           // Data Source ID
    sid: String,            // Spot ID
    devid: String,          // Device Network ID
    devtype: String,        // Device Network Type (devEUI, devID)
    idate: Date,            // Install date in the field
    rdate: Date,            // Remove date from the field
    remarks: String        // Remarks if any (optional, use it for future)
}, {
    timestamps: true
});

module.exports = mongoose.model('device', NoteSchema);