/*############################################################################
# 
# Module: server.js
#
# Description:
#     DNC Server Module (Backend for DNC UI, DNC Endpoints)
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
#     V1.0.0 Tue Feb 14 2023 11:24:35 seenivasan
#       Module created
############################################################################*/
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const appconst = require('./app/misc/constants.js');
const dbconfig = require('./app/config/dbconfig');
const appenv = require('./app/config/envdata')


const app = express();
// parse requests of content-type - application/json

app.use(cors({
  origin: '*'
}));

// app.use(cors({
//   origin: '*', // Specify the allowed origin
//   methods: ['GET', 'POST', 'DELETE'], // Specify the allowed HTTP methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Specify the allowed headers
//   credentials: true // Allow credentials (cookies, HTTP authentication) to be included in requests
// }));


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/version.js')(app);
require('./app/routes/stock.route')(app);
require('./app/routes/user.route')(app);
require('./app/routes/gateway.route')(app);
require('./app/routes/org.route')(app);
require('./app/routes/spot.route')(app);
require('./app/routes/ds.route')(app);
require('./app/routes/device.route')(app);
require('./app/routes/dmd.route')(app);
require('./app/routes/plugin.route')(app);
require('./app/routes/subscription.route')(app);
require('./app/routes/ssu.route')(app);
require('./app/routes/hw.route')(app);
require('./app/routes/capi.route')(app);

dbconfig.dbInit();

var server = app.listen(appenv.envobj.APP_PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log(""+appconst.APP_NAME+" v"+appconst.APP_VERSION+" Listening http://%s:%s", host, port)
  });