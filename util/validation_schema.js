const joi = require('joi');

const authSchema = joi.object({
  email: joi.string().email().lowercase().required(),
  password: joi.string().min(2).required(),
});

const packingSchema = joi.object({
  title: joi.string().required(),
  quantity: joi.number().required(),
  packed: joi.boolean().required(),
});

module.exports = {
  authSchema,
};
