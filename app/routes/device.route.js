/*############################################################################
# 
# Module: device.route.js
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

const devctrl = require('../controllers/device.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {

    app.post('/device/:sname', tokenfn.authenticateJWT, devctrl.addnewdev);

    app.get('/device', tokenfn.authenticateJWT, devctrl.getspotdevices);

    // Get ready to assign devices
    app.get('/rtadev/:orgname', tokenfn.authenticateJWT, devctrl.getrtadevices);

    // Remove Device from the Spot
    app.put('/remdev', tokenfn.authenticateJWT, devctrl.removedevice);

}