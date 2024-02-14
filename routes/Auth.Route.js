const express = require('express');
const router = express.Router();
const authController = require('../controllers/Auth.Controller');

const { verifyAcessToken } = require('../util/jwt_helper');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh-token', authController.refreshToken);

//testing
router.get('/user', verifyAcessToken, (req, res) => {
  res.send('Testting');
});

module.exports = router;
