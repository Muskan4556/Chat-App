import express from "express";
import { verifyToken } from "../middlewares/auth";
import { createChat, getAllChats, getSpecificChats } from "../controllers/chat";

const router = express.Router();

router.post("/", verifyToken, createChat);
router.get("/:id", verifyToken, getSpecificChats);
router.get("/", verifyToken, getAllChats);

export default router;
