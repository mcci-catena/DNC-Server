const constants = require('./misc/constants');

module.exports = function (app) {
    app.get('/about', function(req, res) {
        res.status(200).json({'Application': ''+constants.APP_NAME, 'Version': ''+constants.APP_VERSION, 'Port': ''+constants.APP_PORT});
    });
}

