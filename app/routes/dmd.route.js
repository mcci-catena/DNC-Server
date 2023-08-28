/*############################################################################
# 
# Module: dmd.route.js
#
# Description:
#     Controller for Managing Org module
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
#     V2.0.0 Mon July 29 2023 11:15:21 seenivasan
#       Module created
############################################################################*/

const dmdctrl = require('../controllers/dmd.controller')
const tokenfn = require('../config/auth')

module.exports = (app) => {
    app.get('/dmd', tokenfn.authenticateJWT, dmdctrl.listDmdAll);
    app.get('/dmd/:hwsl', tokenfn.authenticateJWT, dmdctrl.listDmdOne);
    app.put('/dmd', tokenfn.authenticateJWT, dmdctrl.updateDmd);
    app.get('/fdmd', tokenfn.authenticateJWT, dmdctrl.listDmdOnePerHw)
    app.get('/tdmd/:hwsl', tokenfn.authenticateJWT, dmdctrl.getTrackDmd)
    app.delete('/dmd', tokenfn.authenticateJWT, dmdctrl.deleteDmd)
    app.get('/afmdmd', tokenfn.authenticateJWT, dmdctrl.getOneDmdAfm)
    app.post('/dmd', tokenfn.authenticateJWT, dmdctrl.appendDmd)
}