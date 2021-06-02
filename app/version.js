module.exports = function (app) {
    app.get('/version', function(req, res) {
        res.status(200).json({'MCCI Corporation': 'DNC Backend API V1.0c'});
    });
}

