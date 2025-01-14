import mongoose, { InferSchemaType } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    type: {
      type: {
        type: String,
        enum: ["text", "image", "document", "video"],
        required: true,
        default: "text",
      },
    },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

export type TMessage = Omit<
  InferSchemaType<typeof messageSchema>,
  "_id" | "createdAt" | "updatedAt"
> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const Message = mongoose.model("Message", messageSchema);

export default Message;
