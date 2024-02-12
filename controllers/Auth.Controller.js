const createError = require('http-errors');
const { authSchema } = require('../util/validation_schema');

const User = require('../models/User.Model');

module.exports = {
  register: async (req, res, next) => {
    try {
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
