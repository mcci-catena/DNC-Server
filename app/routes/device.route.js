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
   
    // Remove a device from a location    
    // app.put('/rmdevice/:devName', tokenfn.authenticateJWT, devctrl.updateRemoveStatus);
    app.put('/rmdev/:cname', tokenfn.authenticateJWT, devctrl.removeDevice);

    // Replace a device of a location
    //app.post('/rpdevice/:devName', tokenfn.authenticateJWT, devctrl.deviceReplace);
    app.post('/rpdev/:cname', tokenfn.authenticateJWT, devctrl.replaceDevice);

    //app.delete('/device/:devName', tokenfn.authenticateJWT, devctrl.delete);
    app.delete('/device/:cname', tokenfn.authenticateJWT, devctrl.delete);
}