/*############################################################################
# 
# Module: ds.route.js
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

const dsctrl = require('../controllers/ds.controller')
const tokenfn = require('../config/auth')


module.exports = (app) => {
    app.get('/dsrc', tokenfn.authenticateJWT, dsctrl.listsrc);
    app.post('/dsrc', tokenfn.authenticateJWT, dsctrl.addnewdsrc);
    app.post('/getdbl', tokenfn.authenticateJWT, dsctrl.getdblist);
    app.post('/getmmtl', tokenfn.authenticateJWT, dsctrl.getmmtlist)
    app.put('/dsrc/:dsname', tokenfn.authenticateJWT, dsctrl.updatedsrc)

    app.post('/dlist', tokenfn.authenticateJWT, dsctrl.getDevList)

    app.delete('/dsrc/:dsname', tokenfn.authenticateJWT, dsctrl.deleteDs);

}