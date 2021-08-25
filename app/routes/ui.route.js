const uictrl = require('../controllers/ui.controller.js');
const tokenfn = require('../misc/auth.js');

module.exports = (app) => {
    // General signup request from UI reach here
    app.get('/signup', uictrl.signup);
    
    // Admin Email configuration
    app.post('/saeorg', uictrl.updtaeorg);
    
    // Admin signup
    app.post('/asignup', uictrl.asignup);
    
    // General user signup
    app.post('/usignup', uictrl.usignup);

    // Send OTP through Email
    app.post('/send-otp', uictrl.sendOtp);
	
	// List user details
	app.get('/list-user', tokenfn.authenticateJWT, uictrl.listuser);
	
	// Update user details
	app.put('/update-user/:uname', uictrl.updateuser);
	
	// Delete user details
	app.delete('/delete-user/:uname', tokenfn.authenticateJWT, uictrl.deleteuser);
	
	// Forgot password
	app.put('/update-pwd', uictrl.forgotpwd);
	
	// Send OTP through Email
    app.post('/fp-send-otp', uictrl.fpSendOtp);
	
	// Login 
	app.post('/login', uictrl.uiLogin);

    // Authendicate User input
    // app.post('/chkmoa', uictrl.verifyAuth);

    // Test
    // app.post('/test-api', uictrl.testApi)
}