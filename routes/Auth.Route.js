const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.Controller');

const { verifyAcessToken } = require('../util/jwt_helper');

router.post('/register', authController.register);

router.post('/check-user', authController.checkUser);
router.post('/login', authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/verify-pin', authController.verifyPin);
router.post('/set-password', authController.setPassword);

//testing
router.get('/user', verifyAcessToken, (req, res) => {
  res.send('Testting');
});

module.exports = router;
