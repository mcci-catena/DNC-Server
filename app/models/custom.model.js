/*############################################################################
# 
# Module: custom.model.js
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
#     V2.0.0 Wed Aug 16 2023 19:56:21 seenivasan
#       Module created
############################################################################*/
const mongoose = require('mongoose');

const CustomSchema = mongoose.Schema({
    ccode: String,
    cparams : [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Custom', CustomSchema);