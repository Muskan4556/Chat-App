import express from "express";
import { verifyToken } from "../middlewares/auth";
import { allMessages, sendMessage } from "../controllers/message";

const router = express.Router();
router.post("/", verifyToken, sendMessage);
router.get("/:id", verifyToken, allMessages);

export default router;
