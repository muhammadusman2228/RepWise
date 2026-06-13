import mongoose from "mongoose";
import config from "../config/config.js";

export default async function connectDb() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection failed", err);
    throw err;
  }
}
