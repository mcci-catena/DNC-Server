/*############################################################################
# 
# Module: devreg.route.js
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
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const devctrl = require('../controllers/devreg.controller.js');
const tokenfn = require('../misc/auth.js');

module.exports = (app) => {
    
    // Add device 
    //Add a new device with Hardware ID under a Client
    //app.post('/regdev', tokenfn.authenticateJWT, devctrl.mcreate);
    app.post('/regdev', tokenfn.authenticateJWT, devctrl.mcreate);

    //List all devices assigned and unassigned of all clients
    //app.get('/listadev', tokenfn.authenticateJWT, devctrl.adviceList);
    app.get('/listardev', tokenfn.authenticateJWT, devctrl.adeviceList);

    // List all devices of a Client
    app.get('/listardev/:client', tokenfn.authenticateJWT, devctrl.adeviceClient);
    
    // List all devices under a client which are not assigned to a site/location
    //app.get('/listfdev/:client', tokenfn.authenticateJWT, devctrl.mdeviceList);
    app.get('/listfrdev/:client', tokenfn.authenticateJWT, devctrl.mfdeviceList);

    // Edit a device Hardware/device under a client which are not assigned to a sit/location
    //app.put('/regdev/:client', tokenfn.authenticateJWT, devctrl.medit);
    app.put('/regdev/:client', tokenfn.authenticateJWT, devctrl.medit);

    // Delete a device Hardware/device under a client which are not assigned to a sit/location
    // app.delete('/regdev/:client', tokenfn.authenticateJWT, devctrl.mdelete);
    app.delete('/regdev/:client', tokenfn.authenticateJWT, devctrl.mdelete);


    // Get list of devices from InfluxDB
    app.post('/getdev/:client', tokenfn.authenticateJWT, devctrl.getDevices);

}