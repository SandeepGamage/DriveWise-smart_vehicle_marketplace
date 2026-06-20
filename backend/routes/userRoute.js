import express from "express";
import { createUser, loginUser, getAllUsers, getUserByID, updateUser, deleteUser, getCurrentUser } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const userRouter = express.Router();

userRouter.post("/register", upload.single("profilePic"), createUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", verifyToken, getCurrentUser);
userRouter.put("/me", verifyToken, upload.single("profilePic"), updateUser);
userRouter.patch("/:id", verifyToken, deleteUser);
userRouter.get("/:id", getUserByID);
userRouter.get("/", verifyToken, getAllUsers);
userRouter.patch("/test", (req, res) => {
    res.json({ message: "Patch route works" });
});

export default userRouter;
