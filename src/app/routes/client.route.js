const clientctrl = require('../controllers/client.controller.js');


module.exports = (app) => {
    
    // Create a new Client
    app.post('/client', clientctrl.create);

    // Retrieve all clients
    app.get('/clients', clientctrl.find_clients);

    // Retrieve a single Client with clientId
    app.get('/client/:clientName', clientctrl.find_client);

    // Update a Client with clientId
    app.put('/client/:clientId', clientctrl.update);

    // Delete a Client with clientId
    // app.delete('/client/:clientId', clientctrl.delete);
	
	// Get status of client device registration
	app.get('/client-device-status/:clientId', clientctrl.find_device_register_status);
	
	// Fetch database name from InfluxDB
	app.post('/fetch-db-info', clientctrl.fetch_db_names);
  
}