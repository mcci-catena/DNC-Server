const dncctrl = require('../controllers/dnc.controller.js');
const devctrl = require('../controllers/dnc.listdevice.js');

module.exports = (app) => {
    app.post('/tagsk', dncctrl.readtags);
    app.post('/tagsv', dncctrl.readtagval);
    app.post('/alogin', dncctrl.alogin);
    app.post('/dlist', devctrl.getDeviceList);
}