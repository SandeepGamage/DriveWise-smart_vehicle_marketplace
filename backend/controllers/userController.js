import User from "../models/user.js";
import uploadImage from "../utils/imageUpload.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {nanoid} from "nanoid";

export async function getUserByID(req,res){
    try{

        const userID = req.params.id;

        if(!userID){
            return res.status(400).json({ message: "User ID is required" });
        }

        const User = await User.findById(userID);

        if (!User) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(User);

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err.message
        });
    }
}

export async function getAllUsers(req,res){
    try{
        
        if (req.user.role !== "admin") {
            return res.status(400).json({
                message: "Login as an admin for view all users!"
            })
        }

        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err.message
        });
    }
}

export async function createUser(req, res) {
    try {
        const {userName, email, password, phoneNum} = req.body;
        const profilePic = req.file;

        if (!userName || !email || !password || !phoneNum || !profilePic) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const isExisting = await User.findOne({email});

        if(isExisting){
            return res.status(400).json({ message: "User already exists with this email. Try with another Email!" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNum)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        const UID = `USR-${nanoid(12)}`;
        const hashedPassword = bcrypt.hashSync(password, 10);

        const imageUrl = await uploadImage(profilePic);

        const newUser = new User({
            UID : UID,
            userName : userName,
            email : email,
            password : hashedPassword,
            phoneNum : phoneNum,
            profilePic : imageUrl
        });

        const savedUser = await newUser.save();

        if (!savedUser) {
            return res.status(400).json({
                message: "User not saved"
            });
        }

        res.status(201).json({
            message: "Registered successfully!",
            user: savedUser
        });

    } catch (err) {
        res.status(500).json({
            message: "Error creating user",
            error: err.message
        });
    }
}

export async function loginUser(req,res){
    try{
        const {email,password} = req.body;
        
        if(!email || !password){
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.isAdmin ? "admin" : "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const { password: _, ...userData } = user._doc;

        return res.status(200).json({
            message: "Login successful",
            token,
            user: userData
        });

    }catch (err) {
        res.status(500).json({
            message: "Error login user",
            error: err.message
        });
    }
}

export async function suspendUser(req,res){
    try{
        const userID = req.params.id;

        if(req.user.role !== "admin"){
            return res.status(400).json({
                message : "Login as admin to complete the process."
            })
        }

        const suspendedUser = await User.findOneAndUpdate(
            { UID: userID },
            { isSuspend: true },
            { new: true }
        );

        if (!suspendedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message : "User suspended successfully!"
        });

    }catch(err){
        res.status(500).json({
            message : "Internal sever error",
            error : err.message
        });
    }
}

export async function updateUser(req,res){
    try{
        const UserID = req.user.UID;

        const User = findOne({UID});

        if(!User){
            return res.status(404).json({ message: "User not found" });
        }

        const {userName, email, password, phoneNum} = req.body;

    }catch(err){
        res.status(500).json({
            message : "Internal sever error",
            error : err.message
        });
    }
}