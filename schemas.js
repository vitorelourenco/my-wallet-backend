import joi from 'joi';

const newLogSchema = joi.object({
  userId: joi.number().integer().min(1).required(),
  value: joi.number().integer().min(1).required(),
  description: joi.string().min(1).required()
});

const logKindSchema = joi.string().pattern(/(^earning$)|(^expenditure$)/).required();

const authorizationSchema = joi.string().pattern(/^Bearer\s[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i).required();

const newUserSchema = joi.object({
  name: joi.string().min(1).required(),
  email: joi.string().email().required(),
  password: joi.string().min(1).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(1).required()
});

export {
  logKindSchema,
  authorizationSchema,
  loginSchema,
  newLogSchema,
  newUserSchema
}