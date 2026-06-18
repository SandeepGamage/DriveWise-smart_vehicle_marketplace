import express from "express";
import { createUser, loginUser, getAllUsers, getUserByID } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRouter = express.Router();

userRouter.post("/register", upload.single("profilePic"), createUser);
userRouter.post("/login", loginUser);
userRouter.get("/:id", getUserByID);
userRouter.get("/", verifyToken, getAllUsers);

export default userRouter;
