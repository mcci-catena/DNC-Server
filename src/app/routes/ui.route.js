const uictrl = require('../controllers/ui.controller.js');

module.exports = (app) => {
    // General signup request from UI reach here
    app.post('/signup', uictrl.signup);
    
    // Admin Email configuration
    app.post('/saecon', uictrl.updtaemail);
    
    // Admin signup
    app.post('/asignup', uictrl.asignup);
    
    // General user signup
    app.post('/usignup', uictrl.usignup);

    // Send OTP through Email
    // app.post('/send-otp', uictrl.sendOtp);
    app.post('/send-otp', uictrl.checkSendOtp);

    // Authendicate User input
    app.post('/chkmoa', uictrl.verifyAuth);

    // Test
    app.post('/test-api', uictrl.testApi)
}