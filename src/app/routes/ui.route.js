const uictrl = require('../controllers/ui.controller.js');

module.exports = (app) => {
    // General signup request from UI reach here
    app.get('/signup', uictrl.signup);
    
    // Admin Email configuration
    // app.post('/saecon', uictrl.updtaemail);
    
    // Admin signup
    app.post('/asignup', uictrl.asignup);
    
    // General user signup
    app.post('/usignup', uictrl.usignup);

    // Send OTP through Email
    app.post('/send-otp', uictrl.sendOtp);
	
	// List user details
	app.get('/list-user', uictrl.listuser);
	
	// Update user details
	app.put('/update-user/:uname', uictrl.updateuser);
	
	// Delete user details
	app.delete('/delete-user/:uname', uictrl.deleteuser);
	
	// Forgot password
	app.put('/reset-pwd', uictrl.forgotpwd);
	
	// Login 
	app.post('/login', uictrl.uiLogin);
}