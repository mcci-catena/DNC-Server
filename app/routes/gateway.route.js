/*############################################################################
# 
# Module: gateway.route.js
#
# Description:
#     Route for Manage Gateway 
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

const gwctrl = require('../controllers/gateway.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {
    // List all gatways
    app.get('/gwunit', tokenfn.authenticateJWT, gwctrl.listgws);

    // List Gateways of a required organization
    app.get('/gwunit/:orgid', tokenfn.authenticateJWT, gwctrl.listgws);

    // Add new Gateway
    app.post('/gwunit', tokenfn.authenticateJWT, gwctrl.addnewgw);

    // Edit the added Gateway
    app.put('/gwunit', tokenfn.authenticateJWT, gwctrl.updtgw);

    // Add the new status to the unit
    app.post('/rmgw', tokenfn.authenticateJWT, gwctrl.removegw);

    // Add the new status to the unit
    app.delete('/gwunit/:name', tokenfn.authenticateJWT, gwctrl.deleteGw);

    // List Org Gw detail
    app.get('/orggw/:orgname', tokenfn.authenticateJWT, gwctrl.listOrgGw);

    app.post('/agwmr', tokenfn.authenticateJWT, gwctrl.appendgw);
    app.put('/gwmr', tokenfn.authenticateJWT, gwctrl.updategw);
    app.get('/gwmr', tokenfn.authenticateJWT, gwctrl.listOnePerGwmr);
    app.get('/tgwmr/:gwname', tokenfn.authenticateJWT, gwctrl.getTrackGw)


}