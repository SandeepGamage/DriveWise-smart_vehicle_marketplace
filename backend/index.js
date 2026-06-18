import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import userRoute from "./routes/userRoute.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Successfully connected to the database;)");
}).catch((err) => {
    console.log("Database connection failed:(", err);
});

const storage = multer.memoryStorage();

app.use("/api/user", userRoute);

app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000")
});