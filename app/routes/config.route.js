/*############################################################################
# 
# Module: config.route.js
#
# Description:
#     Route for Cornell Sap Endpoints (To add Sugar(Brix) value manually)
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
#     Seenivasan V, MCCI Corporation February 2022
#
# Revision history:
#     V1.0.x Thu Mar 17 2022 17:45:35 seenivasan
#       Module created
############################################################################*/
const configctrl = require('../../config/dbconfig.js')


module.exports = (app) => {
    app.get('/gdbstat', configctrl.getConfig);
}