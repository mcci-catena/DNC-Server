const clientctrl = require('../controllers/client.controller.js');


module.exports = (app) => {
    
    // Create a new Client
    app.post('/client', clientctrl.create);

    // Retrieve all clients
    app.get('/client', clientctrl.findAll);

    // Retrieve a single Client with clientId
    //app.get('/client/:clientId', clientctrl.findOne);

    // Update a Client with clientId
    //app.put('/client/:clientId', clientctrl.update);

    // Delete a Client with clientId
    //app.delete('/client/:clientId', clientctrl.delete);
  
}