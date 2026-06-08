import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors);

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Successfully connected to the database;)");
}).catch((err) => {
    console.log("Database connection failed:(", err);
});

app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000")
});