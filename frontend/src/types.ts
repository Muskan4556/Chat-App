export type TUser = {
  _id?: string;
  name?: string;
  email?: string;
  password?: string;
  phoneNo?: string;
  avatarUrl?: string;
};

export type TMessage = {
  _id?: string;
  senderId?: TUser;
  content?: string;
  chatId?: string | TChat;
  type?: string;
  createdAt?: string;
};

export type TChat = {
  _id?: string;
  users?: [TUser];
  latestMessage?: TMessage;
  updatedAt: string;
};
