// const mongoose = require("mongoose");
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL
      //   {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      // }
    );
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // process.exit(1);
  }
};

export default connectDB;
