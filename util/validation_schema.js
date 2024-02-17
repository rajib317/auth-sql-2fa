const joi = require('joi');

const authSchema = joi.object({
  email: joi.string().email().lowercase().required(),
});
const pinSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  pin: joi.string().min(5).max(6).required(),
});
const setPassword = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(8).required(),
});

module.exports = {
  authSchema,
  pinSchema,
  setPassword,
};
