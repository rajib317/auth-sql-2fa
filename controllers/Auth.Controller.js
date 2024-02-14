const createError = require('http-errors');
const { authSchema } = require('../util/validation_schema');
const User = require('../models/User.Model');
const bcrypt = require('bcrypt');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../util/jwt_helper');
module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const doesExists = await User.findOne({ where: { email: result.email } });
      if (doesExists)
        throw createError.Conflict(`${result.email} is already registered`);

      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(result.password, salt);

      const savedUser = await User.create({
        email: result.email,
        password: hasedPassword,
        firstName: result.firstName,
        lastName: result.lastName,
      });
      const acessToken = await signAccessToken(savedUser.dataValues.id);
      const refreshToken = await signRefreshToken(savedUser.dataValues.id);
      res.send({ acessToken, refreshToken });
    } catch (error) {
      if (error.isJoi) error.status = 422;
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const user = await User.findOne({ where: { email: result.email } });

      if (!user) throw createError.NotFound('User not Registered');

      const isMatch = await user.isValidPassword(result.password);

      if (!isMatch)
        throw createError.Unauthorized('Username/password not valid');
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);
      res.send({ accessToken, refreshToken });
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
