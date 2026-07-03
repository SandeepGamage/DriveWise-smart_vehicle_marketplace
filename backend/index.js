import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import userRoute from "./routes/userRoute.js";
import advertRoutes from "./routes/advertRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Successfully connected to the database");
}).catch((err) => {
    console.log("Database connection failed:", err);
});

const storage = multer.memoryStorage();

app.use("/api/user", userRoute);
app.use("/api/advertisement", advertRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    let predictiveServiceURL = process.env.PREDICTION_SERVICE_URL;
    if (predictiveServiceURL && !predictiveServiceURL.endsWith('/api/predict')) {
        predictiveServiceURL = predictiveServiceURL.replace(/\/$/, '') + '/api/predict';
    }
    res.status(200).json({ 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        predictiveServiceURL: predictiveServiceURL
    });
});

app.listen(process.env.PORT, () => {
    console.log("Server running on port " , process.env.PORT)
});