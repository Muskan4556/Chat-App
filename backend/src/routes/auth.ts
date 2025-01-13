import express from "express";
import { validateLogin, validateSignup } from "../middlewares/validator";
import { login, signup, logout, getValidatedUser } from "../controllers/auth";
import { verifyToken } from "../middlewares/auth";

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/signup", validateSignup, signup);
router.post("/logout", logout);
router.get("/validate-token", verifyToken, getValidatedUser);
export default router;
