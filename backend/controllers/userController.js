import User from "../models/user.js";
import Advert from "../models/advertModel.js";
import uploadImage from "../utils/imageUpload.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

const safeUser = (userDoc) => {
    if (!userDoc) {
        return null;
    }

    const data = userDoc._doc || userDoc;
    const { password: _, ...userData } = data;
    return userData;
};

export async function getUserByID(req, res) {
    try {

        const userID = req.params.id;

        if (!userID) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const foundUser = await User.findById(userID);

        if (!foundUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(safeUser(foundUser));

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

export async function getAllUsers(req, res) {
    try {

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

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

export async function createUser(req, res) {
    try {
        const { userName, email, password, phoneNum } = req.body;
        const profilePic = req.file;

        if (!userName || !email || !password || !phoneNum) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const isExisting = await User.findOne({ email });

        if (isExisting) {
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

        let imageUrl = undefined;
        if (profilePic) {
            imageUrl = await uploadImage(profilePic);
        }

        const newUser = new User({
            UID: UID,
            userName: userName,
            email: email,
            password: hashedPassword,
            phoneNum: phoneNum,
            ...(imageUrl && { profilePic: imageUrl })
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

export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isActive) {
            return res.status(401).json({
                message: "Your account is inactive. Try to create new account."
            })
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

    } catch (err) {
        res.status(500).json({
            message: "Error login user",
            error: err.message
        });
    }
}

export async function suspendUser(req, res) {
    try {
        const userID = req.params.id;

        if (req.user.role !== "admin") {
            return res.status(400).json({
                message: "Login as admin to complete the process."
            })
        }

        const suspendedUser = await User.findOneAndUpdate(
            { UID: userID },
            { isActive: false },
            { new: true }
        );

        if (!suspendedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User suspended successfully!"
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal sever error",
            error: err.message
        });
    }
}

export async function updateUser(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { userName, email, password, phoneNum } = req.body;
        const updateData = {};

        if (userName?.trim()) {
            updateData.userName = userName.trim();
        }

        if (email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({ message: "Invalid email format" });
            }

            const duplicateEmail = await User.findOne({
                email: email.trim().toLowerCase(),
                _id: { $ne: userId }
            });

            if (duplicateEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }

            updateData.email = email.trim().toLowerCase();
        }

        if (phoneNum?.trim()) {
            const phoneRegex = /^\d{10}$/;

            if (!phoneRegex.test(phoneNum.trim())) {
                return res.status(400).json({ message: "Invalid phone number format" });
            }

            updateData.phoneNum = phoneNum.trim();
        }

        if (password?.trim()) {
            if (password.trim().length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            updateData.password = bcrypt.hashSync(password.trim(), 10);
        }

        if (req.file) {
            updateData.profilePic = await uploadImage(req.file);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No changes provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        const { password: _, ...safeUser } = updatedUser._doc;

        return res.status(200).json({
            message: "Profile updated successfully",
            user: safeUser
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal sever error",
            error: err.message
        });
    }
}

export async function deleteUser(req, res) {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const deletedUser = await User.findOneAndUpdate({
            UID: userId
        }, {
            isActive: false
        }, {
            new: true
        })

        if (!deletedUser) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        return res.status(200).json({
            message: "User deleted successfully"
        })

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

export async function getCurrentUser(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Current user retrieved successfully",
            user: safeUser(user)
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}