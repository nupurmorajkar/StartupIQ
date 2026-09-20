import express from "express";
import { signup, login, getProfile, updateProfile, switchCraft } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/switch-craft", switchCraft);

export default router;
