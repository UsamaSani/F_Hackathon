import Joi from "joi";

const signinSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export { signinSchema };
