/*############################################################################
# 
# Module: org.route.js
#
# Description:
#     Route for Manage Organization
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
#     V2.0.0 Tue April 11 2023 14:56:21 seenivasan
#       Module created
############################################################################*/

const orgctrl = require('../controllers/org.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {
    // List all gatways
    app.get('/org', tokenfn.authenticateJWT, orgctrl.listorgs);

    // Add new Organization
    app.post('/org', tokenfn.authenticateJWT, orgctrl.addneworg);

    // Edit the Organization
    app.put('/org', tokenfn.authenticateJWT, orgctrl.updtorg);

    app.put('/org/:orgname', tokenfn.authenticateJWT, orgctrl.updateOrg);

    // Add the new status to the unit
    // app.post('/rmgw', tokenfn.authenticateJWT, gwctrl.removegw);
    app.get('/org/:userid', tokenfn.authenticateJWT, orgctrl.listUserOrg);

    app.get('/uorg/:userid', tokenfn.authenticateJWT, orgctrl.listUserOrg);

    // Delete an Organization
    app.delete('/org/:orgname', tokenfn.authenticateJWT, orgctrl.deleteOrg);

    app.get('/orgtags/:orgname', tokenfn.authenticateJWT, orgctrl.listOrgTags);
}