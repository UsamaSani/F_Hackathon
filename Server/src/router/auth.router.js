import express from "express";
const router = express.Router();
import { validator } from "../middlewares/validator.js";
import { signupSchema } from "../validations/auth/signup.validation.js";
import { User } from "../schema/user.schema.js";
import bcrypt from "bcrypt";
import { signinSchema } from "../validations/auth/signin.validation.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../lib/services/sendEmail.js";
import { getCode } from "../lib/helpers/getCode.js";
import { Otp } from "../schema/otp.schema.js";
import dotenv from "dotenv";
dotenv.config();

router.post("/signup", validator(signupSchema), async (req, res) => {
  const { password, ...data } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const newPayload = {
    password: hashedPassword,
    ...data,
  };
  const otpCode = getCode();

  const newUser = new User(newPayload);
  const newOTP = new Otp({
    userId: newUser._id,
    code: otpCode,
  });

  await Promise.all([
    newUser.save(),
    newOTP.save(),
    // sendEmail({
    //   to: data.email,
    //   subject: "Account Verification",
    //   text: `Please verify your account using this OTP: ${otpCode}`,
    // }),
  ]);

  return res
    .status(201)
    .send({ data: newUser.id, message: "User signup successfully" });
});

router.post("/signin", validator(signinSchema), async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email }).select("email password");
  if (!user) {
    res.status(401).send({ error: "Invalid Credential" });
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    res.status(401).send({ error: "Invalid Credential" });
  }

  const tokenPayload = { id: user.id, email: user.email };

  const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  return res
    .status(200)
    .send({ data: { accessToken }, message: "User Signin successfully" });
});

export { router };
