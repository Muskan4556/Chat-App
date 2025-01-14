import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoute from "./routes/auth";
import userRoute from "./routes/user";
import chatRoute from "./routes/chat";
import messageRoute from "./routes/message";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("Connected to Socket.io");
  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log("logged User: ", userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user join room: ", room);
  });

  socket.on("send message", (messageData) => {
    const { chatId, content, senderId } = messageData;
    io.to(chatId).emit("message received", { content, senderId, chatId });
    console.log("Message sent to chat:", chatId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// db
mongoose
  .connect(process.env.MONGODB_CONNECTIONS_STRING as string)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(3000, () => {
      console.log(`Server is running at PORT_NO: 3000: http://localhost:3000/`);
    });
  })
  .catch((err) => console.log("MongoDB error: ", err));

// middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    message: "Helath OK",
  });
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/message", messageRoute);
