const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const dbConfig = require('./config/dbconfig.js');
const constants = require('./app/misc/constants');

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

require('./app/about.js')(app);


global.reqCnt = 0;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database.', err);
    //process.exit();
});


var server = app.listen(constants.APP_PORT, function () {
  var host = server.address().address
  var port = server.address().port
  console.log(constants.APP_NAME, constants.APP_VERSION, " Listening http://%s:%s", host, port)
});

