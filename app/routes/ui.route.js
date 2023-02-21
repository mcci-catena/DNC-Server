/*############################################################################
# 
# Module: ui.route.js
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

const uictrl = require('../controllers/ui.controller.js');
const tokenfn = require('../misc/auth.js');

module.exports = (app) => {
    // General signup request from UI reach here
    app.post('/signup', uictrl.signup);
    
    // Admin Email configuration
    app.post('/saeorg', uictrl.updtaeorg);
    
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

    // Send User signup invitation 
	app.post('/invite', uictrl.sendInvite);

    // Send Admin signup invitation 
    app.post('/ainvite', uictrl.sendAinvite);

	// Change Role
	app.post('/chrole', tokenfn.authenticateJWT, uictrl.updtRole);

}