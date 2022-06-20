/*############################################################################
# 
# Module: dnc.route.js
#
# Description:
#     Route for DNC Endpoints (To handle DNC customized Tag keys and values)
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
const dncctrl = require('../controllers/dnc.controller.js');
const devctrl = require('../controllers/dnc.listdevice.js');

module.exports = (app) => {
    app.post('/tagsk', dncctrl.readtags);
    app.post('/tagsv', dncctrl.readtagval);
    app.post('/alogin', dncctrl.alogin);
    app.post('/plogin', dncctrl.pluginLogin);
    app.post('/dlist', devctrl.getDeviceList);
    app.post('/gfields', dncctrl.getFields);
    app.post('/gdevices', dncctrl.getDevices);
    app.post('/gdevmap', devctrl.getDevMaps);
}