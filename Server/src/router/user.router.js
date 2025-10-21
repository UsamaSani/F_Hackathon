import express from "express";
const router = express.Router();
import { User } from "../schema/user.schema.js";
import { validator } from "../middlewares/validator.js";
import { createUserSchema } from "../validations/user.validation.js";

router.post("/", validator(createUserSchema), async (req, res) => {
  try {
    const user = {
      ...req.body,
    };
    const newUser = new User(user);
    await newUser.save();
    res.status(201).json({ data: newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/", async (req, res) => {
  const { page, limit, search } = req.query;
  console.log(page, limit, search);

  const offset = (page - 1) * limit;
  let condition = {};
  if (search) {
    condition.firstName = search;
  }
  const data = await User.find(condition)
    .limit(limit)
    .skip(offset)
    .sort({ firstName: 1 });
  res.status(200).json({ data });
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await User.findById(id);
  res.status(200).json({ data });
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await User.findByIdAndDelete(id);
  res.status(200).json({ data: id, message: "Your user has been deleted" });
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true });

  res.status(200).json({ data: updatedUser });
});

export { router };
