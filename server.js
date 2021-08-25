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

