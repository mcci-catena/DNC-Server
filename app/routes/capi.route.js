/*############################################################################
# 
# Module: capi.route.js
#
# Description:
#     Route for Manage Organization
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
#     V2.0.0 Tue April 11 2023 14:56:21 seenivasan
#       Module created
############################################################################*/

const apictrl = require('../controllers/capi.controller')
const dnctrl = require('../controllers/dnlink.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {
    app.get('/apic', tokenfn.authenticateJWT, apictrl.listapi);
    app.post('/apic', tokenfn.authenticateJWT, apictrl.updateapi);
    app.post('/sdnlink', tokenfn.authenticateJWT, dnctrl.dnlinkquery)
}