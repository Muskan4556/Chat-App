import { Request, Response } from "express";
import Chat from "../models/chat";

export const createChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    let chatExist = await Chat.findOne({
      users: { $all: [req.userId, userId] },
    });
    if (chatExist) {
      return res.status(400).json({ message: "Chat already exists" });
    }

    chatExist = new Chat({
      users: [req.userId, userId],
      latestMessage: null,
    });

    await chatExist.save();

    return res.status(201).json({
      message: "Chat created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getSpecificChats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = req.params.id;

    if(!userId){
      return res.status(400).json({ message: "UserId is required" });
    }

    const chat = await Chat.findOne({
      users: { $all: [req.userId, userId] },
    })
      .populate("users", "-password")
    return res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getAllChats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const chat = await Chat.find({})
      .populate("users", "-password")
      .sort({ updatedAt: -1 });
    return res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
