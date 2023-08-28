/*############################################################################
# 
# Module: config.model.js
#
# Description:
#     Route for Manage User API
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
#     V2.0.0 Fri Feb 24 2023 14:56:21 seenivasan
#       Module created
############################################################################*/
const mongoose = require('mongoose');

const ConfigSchema = mongoose.Schema({
    email: String,
    org: String,
    status: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Config', ConfigSchema);