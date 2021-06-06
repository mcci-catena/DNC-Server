const uictrl = require('../controllers/ui.controller.js');

module.exports = (app) => {
    app.post('/signup', uictrl.signup);
    app.post('/saecon', uictrl.updtaemail);
    app.post('/asignup', uictrl.asignup);
    app.post('/usignup', uictrl.usignup);
    app.post('/samail', uictrl.sendAmail);
    app.post('/send-admin-otp',uictrl.sendAdminOtp);
}