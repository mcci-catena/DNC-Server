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

const spotctrl = require('../controllers/spot.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {
    // List all Locations
    app.get('/spot', tokenfn.authenticateJWT, spotctrl.listspots);

    // List Locations of a required organization
    app.get('/spot/:orgname', tokenfn.authenticateJWT, spotctrl.listspots);

    // Add new Location
    app.post('/spot/:orgname', tokenfn.authenticateJWT, spotctrl.addnewspot);

    // Edit the added Location
    app.put('/spot/:sname', tokenfn.authenticateJWT, spotctrl.updtspot);

    // Add the new status to the unit
    app.post('/rmspot', tokenfn.authenticateJWT, spotctrl.removespot);

    app.delete('/spot/:sname', tokenfn.authenticateJWT, spotctrl.deleteSpot);

    app.get('/dlspot/:orgname', tokenfn.authenticateJWT, spotctrl.listspotmaps);

}