import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";   

dotenv.config({
    path: "./.env",
});

connectDB().then(() => {

     app.on("error", (err) => {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    });
    app.listen(process.env.PORT || 8000, () => { 
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((error) => {
    console.error("MongoDB connection failed :", error);
    process.exit(1); // Exit the process with failure
});











// import express from "express";
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (err) => {
//       console.error("Error connecting to MongoDB:", err);
//       throw err;
//     });
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("Error connecting to MongoDB:", err);
//   }
// })();
