import joi from 'joi';

const earningOrExpenditureSchema = joi.object({
  idUser: joi.number().integer().min(1).required(),
  value: joi.number().integer().min(1).required(),
  description: joi.string().min(1).required()
});

const authSchema = joi.object({
  user: joi.object({
    id: joi.number().integer().min(1).required()
  }).required()
})

export {
  earningOrExpenditureSchema,
  authSchema
}