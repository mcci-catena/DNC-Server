/*############################################################################
# 
# Module: stock.route.js
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

const stockctrl = require('../controllers/stock.controller')
const tokenfn = require('../config/auth')

module.exports = (app) => {
    app.get('/stock', tokenfn.authenticateJWT, stockctrl.listStockAll);
    app.get('/stock/:orgid', tokenfn.authenticateJWT, stockctrl.listStockOrg);
    app.get('/astock', tokenfn.authenticateJWT, stockctrl.listAssigned);

    app.post('/stock', tokenfn.authenticateJWT, stockctrl.addstock);
    app.put('/stock', tokenfn.authenticateJWT, stockctrl.updtstock);

    app.get('/stock', tokenfn.authenticateJWT, stockctrl.updtstock);
    app.delete('/stock/:hwsl', tokenfn.authenticateJWT, stockctrl.deleteStock);
}