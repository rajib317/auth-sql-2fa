const joi = require('joi');

const userSchema = joi.object({
  email: joi.string().email().lowercase().required(),
});
const pinSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  pin: joi.string().min(5).max(6).required(),
});
const passSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(8).required(),
});
const emailSchema = joi.object({
  to: joi.string().email().lowercase().required(),
  subject: joi.string(),
  text: joi.string(),
});

module.exports = {
  userSchema,
  pinSchema,
  passSchema,
  emailSchema,
};
