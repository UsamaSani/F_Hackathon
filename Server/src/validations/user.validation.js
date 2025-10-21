import Joi from "joi";

const createUserSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  age: Joi.number().min(18).max(100).required(),
  status: Joi.boolean().required(),
  email: Joi.string().email().required(),
});

export { createUserSchema };
