import mongoose from "mongoose";
const { connect } = mongoose;
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.DB_URI;
const connectDB = async () => {
  try {
    await connect(uri);
    console.log("Database connected");
  } catch (err) {
    console.log(err);
    throw new Error("Database not able to connect ",err);
  }
};

export { connectDB };