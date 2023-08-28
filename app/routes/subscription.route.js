/*############################################################################
# 
# Module: subscription.route.js
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

const subsctrl = require('../controllers/subscription.controller')
const tokenfn = require('../config/auth')

module.exports = (app) => {
    app.get('/subs', tokenfn.authenticateJWT, subsctrl.listSubsAll);
    app.post('/subs', tokenfn.authenticateJWT, subsctrl.addSubs);
    app.put('/subs', tokenfn.authenticateJWT, subsctrl.updtSubs);
    app.delete('/subs', tokenfn.authenticateJWT, subsctrl.deleteSubs);

    // app.get('/stock/:orgid', tokenfn.authenticateJWT, stockctrl.listStockOrg);

}