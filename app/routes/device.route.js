/*############################################################################
# 
# Module: device.route.js
#
# Description:
#     Route for Device Configuration End points
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
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const devctrl = require('../controllers/device.controller.js');
const tokenfn = require('../misc/auth.js');

module.exports = (app) => {
    
    // Create a new Note
    app.post('/device', tokenfn.authenticateJWT, devctrl.create);

    // List all device under a location
    //app.post('/listdevice', tokenfn.authenticateJWT, devctrl.findAll);
    app.get('/listadev/:client', tokenfn.authenticateJWT, devctrl.adevClient);

    // List a device which is in active under a location/name
    //app.post('/listrmdev', tokenfn.authenticateJWT, devctrl.showRmDevice);
    app.get('/listrmdev/:client', tokenfn.authenticateJWT, devctrl.showRmDevice);

    // List all device ID under a deviceName
    //app.post('/listdev/:devName', devctrl.deviceList);
   
    // Edit a device from a location
    //app.put('/device/:client', tokenfn.authenticateJWT, devctrl.medit);
    app.put('/device/:client', tokenfn.authenticateJWT, devctrl.medit);
    
    // Remove a device from a location    
    // app.put('/rmdevice/:devName', tokenfn.authenticateJWT, devctrl.updateRemoveStatus);
    app.put('/rmdev/:cname', tokenfn.authenticateJWT, devctrl.removeDevice);

    // Replace a device of a location
    //app.post('/rpdevice/:devName', tokenfn.authenticateJWT, devctrl.deviceReplace);
    app.post('/rpdev/:cname', tokenfn.authenticateJWT, devctrl.replaceDevice);

    //app.delete('/device/:devName', tokenfn.authenticateJWT, devctrl.delete);
    app.delete('/device/:cname', tokenfn.authenticateJWT, devctrl.delete);
}