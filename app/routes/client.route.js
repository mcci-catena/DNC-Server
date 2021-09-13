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
    // app.delete('/client/:clientId', clientctrl.delete);
	
	// Get status of client device registration
	app.get('/client-device-status/:clientId', tokenfn.authenticateJWT, clientctrl.find_device_register_status);
	
	// Fetch database name from InfluxDB
	//app.post('/fetch-db-info', tokenfn.authenticateJWT, clientctrl.fetch_db_names);
    app.post('/fetch-db-info', clientctrl.fetch_db_names);

    // Fetch measurement name from InfluxDB
	//app.post('/fetch-mmt-info', tokenfn.authenticateJWT, clientctrl.fetch_mmt_names);
    app.post('/fetch-mmt-info', clientctrl.fetch_mmt_names);
  
}