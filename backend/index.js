import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
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

// Routes
app.use("/api", advertRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port", process.env.PORT || 3000);
});