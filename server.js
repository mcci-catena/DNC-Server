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
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const cors = require('cors');
const express = require('express');
const dbConfig = require('./config/dbconfig.js');
const mongoose = require('mongoose');
const appconst = require('./app/misc/constants.js');

const bodyParser = require('body-parser');

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

require('./app/routes/client.route.js')(app);
require('./app/routes/device.route.js')(app);
require('./app/routes/dnc.route.js')(app);
require('./app/routes/ui.route.js')(app);
require('./app/routes/devreg.route.js')(app);
require('./app/routes/brix.route.js')(app);

require('./app/version.js')(app);

global.reqCnt = 0;
global.tagreq = "";

// Connecting to the database
mongoose.Promise = global.Promise;


mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database.', err);
}); 


var server = app.listen(appconst.APP_PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log(""+appconst.APP_NAME+" v"+appconst.APP_VERSION+" Listening http://%s:%s", host, port)
});