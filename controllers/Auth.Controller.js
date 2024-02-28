const createError = require('http-errors');
const {
  userSchema,
  pinSchema,
  passSchema,
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
const axios = require('axios');
module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await userSchema.validateAsync(req.body);

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
      if (!user) throw createError.Unauthorized('User does not exist');
      const record = await Login.findOne({
        where: { userId: user.id, isPinVerified: false },
        order: [['createdAt', 'DESC']],
        limit: 1,
      });

      if (!record) throw createError.Unauthorized();

      if (record.pin !== +result.pin)
        throw createError.Unauthorized('Pin Does not match');

      record.update({ isPinVerified: true });

      const acessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
      res.send({
        acessToken,
        refreshToken,
        message: 'Logged In!',
        loginLevel: 4,
      });
    } catch (error) {
      next(error);
    }
  },

  setPassword: async (req, res, next) => {
    try {
      const result = await passSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });
      if (!user) createError.Unauthorized();
      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(result.password, salt);

      user.update({ password: hasedPassword });

      res.send({ loginLevel: 2, message: 'password is set' });
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    // if all ok send login level 3
    try {
      const result = await passSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });

      if (!user) throw createError.NotFound('User not Registered');

      const isMatch = await user.isValidPassword(result.password);

      if (!isMatch)
        throw createError.Unauthorized('Wrong Username or password');

      const [lastLogin] = await Login.findAll({
        limit: 1,
        attributes: ['isPinVerified', 'pin'],
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
      });

      const emailPayload = {
        to: user.email,
        subject: 'TalkTalker Login',
        text: '',
      };

      // If pin is not verified from the last time
      if (!lastLogin.dataValues.isPinVerified) {
        emailPayload.text = `Your pin is ${lastLogin.dataValues.pin}`;
      } else {
        // If there is no last attempt create the pin
        const pin = generatePin();
        const pinSet = await Login.create({
          userId: user.id,
          isPinVerified: false,
          pin,
        });
        if (!pinSet) throw createError.InternalServerError();
        emailPayload.text = `Your pin is ${pin}`;
      }
      const resEmail = await axios.post(
        process.env.EMAIL_SERVER_URI + '/email',
        emailPayload
      );

      if (resEmail) res.send({ loginLevel: 3, message: resEmail.data.message });
    } catch (error) {
      if (error.isJoi)
        return next(
          createError.BadRequest(error.details.map((d) => d.message).join('. '))
        );
      next(error);
    }
  },

  checkUser: async (req, res, next) => {
    // if all ok send login level 1 or 2 depending on if user email is set to null or not.
    try {
      const result = await userSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });

      if (!user) throw createError.NotFound('User not Registered');

      // User is new and password is not set yet: login level 1
      if (user.password === null)
        res.send({ loginLevel: 1, message: 'Set new password' });
      res.send({ loginLevel: 2, message: 'Enter Password' });
    } catch (error) {
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
