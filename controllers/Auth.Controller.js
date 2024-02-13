const createError = require('http-errors');
const { authSchema } = require('../util/validation_schema');
const User = require('../models/User.Model');
const bcrypt = require('bcrypt');

module.exports = {
  register: async (req, res, next) => {
    try {
      const { email, firstName, lastName, password } =
        await authSchema.validateAsync(req.body);

      const doesExists = await User.findOne({ where: { email } });
      if (doesExists)
        throw createError.Conflict(`${email} is already registered`);

      const salt = await bcrypt.genSalt(10);
      const hasedPassword = await bcrypt.hash(password, salt);

      User.create({ email, password: hasedPassword, firstName, lastName });
    } catch (error) {
      if (error.isJoi) error.status = 422;
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
    } catch (error) {
      if (error.isJoi)
        return next(createError.BadRequest('Invalid Username/Password'));
      next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  },
};
