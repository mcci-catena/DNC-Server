/*############################################################################
# 
# Module: devreg.model.js
#
# Description:
#     Model schema for Device Registry collection
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
#     V1.1.2 Wed Feb 23 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');

const NoteSchema = mongoose.Schema({
    cid: String,
    hwid: String,
    deviceid: String,
    devID: String,
    devEUI: String,
    idate: Date,
    rdate: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('Rdevices', NoteSchema);