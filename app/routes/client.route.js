/*############################################################################
# 
# Module: client.route.js
#
# Description:
#     Route for Manage Client API
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

const clientctrl = require('../controllers/client.controller.js');
const tokenfn = require('../misc/auth.js');

module.exports = (app) => {
    
    // Create a new Client
    //app.post('/client', tokenfn.authenticateJWT, clientctrl.create);
    app.post('/client', clientctrl.create);

    // Retrieve all clients
    app.get('/clients', tokenfn.authenticateJWT, clientctrl.find_clients);

    // Retrieve a single Client with clientId
    app.get('/client/:clientId', tokenfn.authenticateJWT, clientctrl.find_client);

    // Update a Client with clientId
    app.put('/client/:clientId', tokenfn.authenticateJWT, clientctrl.update);

    // Delete a Client with clientId
    app.delete('/client/:clientId', tokenfn.authenticateJWT, clientctrl.delete);
    
    // Get status of client device registration
    app.get('/client-device-status/:clientId', tokenfn.authenticateJWT, clientctrl.find_device_register_status);
	
    // Fetch database name from InfluxDB
    //app.post('/fetch-db-info', tokenfn.authenticateJWT, clientctrl.fetch_db_names);
    app.post('/fetch-db-info', tokenfn.authenticateJWT, clientctrl.fetch_db_names);

    // Fetch measurement name from InfluxDB
    //app.post('/fetch-mmt-info', tokenfn.authenticateJWT, clientctrl.fetch_mmt_names);
    app.post('/fetch-mmt-info', tokenfn.authenticateJWT, clientctrl.fetch_mmt_names);
  
}