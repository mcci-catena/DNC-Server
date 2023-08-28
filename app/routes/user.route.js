/*############################################################################
# 
# Module: user.route.js
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
#     V2.0.0 Thu Mar 02 2023 17:51:21 seenivasan
#       Module created
############################################################################*/

const userctrl = require('../controllers/user.controller');
const tokenfn = require('../config/auth')


module.exports = (app) => {
     // Admin Email configuration
     app.post('/saeorg', userctrl.updtaeorg);

     // app.post('/cconfig', userctrl.updtcconfig)

     // app.get('/cconfig', tokenfn.authenticateJWT,userctrl.getcconfig)

     // Send Admin signup invitation 
     app.post('/ainvite', userctrl.sendAinvite);

     app.post('/slink', userctrl.sendElink);

     app.post('/signup', userctrl.signUp);

     app.delete('/pwd', userctrl.forgotpwd);

     // Login 
	app.post('/login', userctrl.userLogin);

     // List All users detail
     app.get('/user', tokenfn.authenticateJWT, userctrl.listuser);

     // List user detail
     app.get('/user/:uname', tokenfn.authenticateJWT, userctrl.listuser);

     // Update user detail
	app.put('/user/:uname', tokenfn.authenticateJWT, userctrl.updateuser);

     // Delete user detail
	app.delete('/user/:uname', tokenfn.authenticateJWT, userctrl.deleteuser);

     // Change Role
	app.put('/chrole', tokenfn.authenticateJWT, userctrl.updtRole);

     app.get('/user', tokenfn.authenticateJWT, userctrl.listuser);

     // List Org user detail
     app.get('/orguser/:orgname', tokenfn.authenticateJWT, userctrl.listOrgUser);

     // Change Password
	app.put('/chpwd', tokenfn.authenticateJWT, userctrl.updatePwd);

}