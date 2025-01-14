import { Request, Response } from "express";
import Message from "../models/Message";
import Chat from "../models/chat";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { chatId, content, type, fileUrl } = req.body;

    if (!chatId || !content) {
      return res
        .status(400)
        .json({ message: "ChatId and content are required" });
    }

    const message = new Message({
      senderId: req.userId,
      chatId: chatId,
      content: content,
      type: type,
      fileUrl: fileUrl,
    });

    await message.save();

    await Chat.findByIdAndUpdate(
      { _id: chatId },
      {
        latestMessage: message,
      }
    );
    return res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const allMessages = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const chatId = req.params.id;
    if (!chatId) {
      return res.status(400).json({ message: "ChatId is required" });
    }

    const messages = await Message.find({ chatId: chatId })
      .populate("chatId")
      .populate("senderId", "-password");
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
