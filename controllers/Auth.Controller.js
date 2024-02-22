const createError = require('http-errors');
const {
  authSchema,
  pinSchema,
  setPassword,
} = require('../util/validation_schema');
const User = require('../models/User.Model');
const Login = require('../models/Login.Model');
const bcrypt = require('bcrypt');

const sequelize = require('../util/init_mysql');

const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../util/jwt_helper');
const generatePin = require('../util/generate_pin');
const { default: axios } = require('axios');
module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const doesExists = await User.findOne({ where: { email: result.email } });
      if (doesExists)
        throw createError.Conflict(`${result.email} is already registered`);

      // const salt = await bcrypt.genSalt(10);
      // const hasedPassword = await bcrypt.hash(result.password, salt);

      const savedUser = await sequelize.transaction(async (t) => {
        const user = await User.create(
          {
            email: result.email,
          },
          { transaction: t }
        );

        await Login.create(
          {
            userId: user.id,
            isPinVerified: false,
            pin: generatePin(),
          },
          { transaction: t }
        );

        return user;
      });

      res.send({ message: 'User Created.' });

      // const acessToken = await signAccessToken(savedUser.dataValues.id);
      // const refreshToken = await signRefreshToken(savedUser.dataValues.id);
      // res.send({ acessToken, refreshToken });
    } catch (error) {
      if (error.isJoi) error.status = 422;
      next(error);
    }
  },

  verifyPin: async (req, res, next) => {
    try {
      const result = await pinSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });
      const record = await Login.findOne({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      if (record.pin !== +result.pin)
        throw createError.Unauthorized('Pin Does not match');

      record.update({ isPinVerified: true });

      const acessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
      res.send({
        acessToken,
        refreshToken,
        message: 'Logged In!',
        loginLevel: 3,
      });
    } catch (error) {
      next(error);
    }
  },
  setPassword: async (req, res, next) => {
    try {
      const result = await setPassword.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });
      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(result.password, salt);

      user.update({ password: hasedPassword });

      res.send({ loginLevel: 2, message: 'password is set' });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });

      if (!user) throw createError.NotFound('User not Registered');

      if (user.password === null)
        res.send({ loginLevel: 1, msg: 'Set new password' });

      const lastLogin = await Login.findOne({
        attributes: ['isPinVerified'],
        where: { userId: user.id },
      });
      // If pin is not verified from the last time
      if (!lastLogin.dataValues.isPinVerified) {
        await axios.post(process.env.EMAIL_SERVER_URI + '/email', {
          to: user.email,
          subject: 'PIN for TalkTo Login',
          text: lastLogin.dataValues.pin,
        });

        console.log('Pinned to email', {
          to: user.email,
          subject: 'PIN for TalkTo Login',
          text: lastLogin.dataValues.pin,
        });

        res.send({
          loginLevel: 2,
          message: 'Please check your email.',
        });
      }

      //   const isMatch = await user.isValidPassword(result.password);

      // if (!isMatch)
      //   throw createError.Unauthorized('Username/password not valid');

      // user.create({ association: 'logins' });

      const pinSet = await Login.create({
        userId: user.id,
        isPinVerified: false,
        pin: generatePin(),
      });
      if (!pinSet) createError.InternalServerError();

      res.send({ loginLevel: 2, message: 'Please check email' });

      // const pin = generatePin();
      // user.update({ pin });

      // const accessToken = await signAccessToken(user.id);
      // const refreshToken = await signRefreshToken(user.id);
      // res.send({ accessToken, refreshToken });
    } catch (error) {
      if (error.isJoi)
        return next(createError.BadRequest('Invalid Username/Password'));
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);
      const accessToken = await signAccessToken(userId);
      const newRefreshToken = await signRefreshToken(userId);
      res.send({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
      next(error);
    }
  },
};
