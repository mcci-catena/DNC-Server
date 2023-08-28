/*############################################################################
# 
# Module: org.route.js
#
# Description:
#     Route for Testing
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

const testctrl = require('../controllers/test.controller')
// const tokenfn = require('../config/auth')


module.exports = (app) => {
    // List all gatways
    app.get('/stock', testctrl.liststock);
    app.get('/stock/:orgid', testctrl.liststock);

    // Add new Organization
    app.post('/stock', testctrl.addstock);

    // Edit the Organization
    // app.put('/stock', orgctrl.updtstock);

    // Add the new status to the unit
    // app.post('/rmgw', tokenfn.authenticateJWT, gwctrl.removegw);

}