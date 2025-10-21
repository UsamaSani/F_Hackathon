import { Password } from "../../lib/patterns.js";
import Joi from "joi";

const signupSchema = Joi.object({
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  userName: Joi.string().min(3).required(),
  password: Joi.string().required().min(8).pattern(Password).messages({
    "string.pattern.base":
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
  }),
  email: Joi.string().email().required(),
},{Timestamps: true});

export { signupSchema };
