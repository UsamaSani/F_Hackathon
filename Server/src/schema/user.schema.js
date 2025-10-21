import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    userName: { type: String, required: true },
    age: { type: Number, required: false, index: true },
    email: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    isAdmin: Boolean,
  },
  { timestamps: true }
);

userSchema.index({ email: 1, status: 2 });
const User = model("user", userSchema);
export { User };
