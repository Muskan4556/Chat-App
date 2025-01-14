import express from "express";
import { verifyToken } from "../middlewares/auth";
import { deleteUser, getAllUser, getUserById, updateUser } from "../controllers/user";

const router = express.Router();

router.get("/", verifyToken, getAllUser);
router.get("/:id", verifyToken, getUserById)
router.put("/:id", verifyToken, updateUser)
router.delete("/:id", verifyToken, deleteUser)

export default router;
