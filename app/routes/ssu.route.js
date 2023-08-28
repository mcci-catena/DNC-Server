/*############################################################################
# 
# Module: ssu.route.js
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
#     V2.0.0 Fri Feb 24 2023 14:56:21 seenivasan
#       Module created
############################################################################*/
const ssuctrl = require('../controllers/ssu.controller')
const tokenfn = require('../config/auth')

module.exports = (app) => {
    app.post('/ssu', tokenfn.authenticateJWT, ssuctrl.addssu);
    app.get('/ssu', tokenfn.authenticateJWT, ssuctrl.showallssu);
    app.post('/assu', tokenfn.authenticateJWT, ssuctrl.appendssu);
    app.put('/ssu', tokenfn.authenticateJWT, ssuctrl.updatessu);
    app.get('/sdmd', tokenfn.authenticateJWT, ssuctrl.listDmdOnePerSsu)
    app.get('/tsdmd/:ssuid', tokenfn.authenticateJWT, ssuctrl.getTrackDmd)
    // app.get('/stock', tokenfn.authenticateJWT, stockctrl.listStockAll);
    // app.get('/stock/:orgid', tokenfn.authenticateJWT, stockctrl.listStockOrg);

    // app.put('/stock', tokenfn.authenticateJWT, stockctrl.updtstock);

    // app.delete('/stock/:hwsl', tokenfn.authenticateJWT, stockctrl.deleteStock);
}