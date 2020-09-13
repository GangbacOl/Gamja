const express = require('express');
const router = express.Router();
const ctrl = require('./auth.ctrl');

router.post('/login', ctrl.login);
router.post('/register', ctrl.register);
router.post('/sendMail', ctrl.sendMail);
router.get('/confirmEmail', ctrl.confirmEmail);

module.exports = router;
