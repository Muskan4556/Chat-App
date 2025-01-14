import mongoose, { InferSchemaType } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },

    type: {
      type: String,
      required: true,
      default: "text",
    },
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
