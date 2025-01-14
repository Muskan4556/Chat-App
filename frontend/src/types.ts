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
  type?: string
  createdAt?: string;
};

export type TChat = {
  _id?: string;
  users?: [TUser];
  latestMessage?: TMessage;
};

/*
{
    "_id": "67863f112e22b6074dfa4bcf",
    "users": [
        {
            "_id": "67853bfea35bc4266975d53d",
            "name": "Ayush",
            "email": "ayush123@gmail.com",
            "phoneNo": "7896541298",
            "avatarUrl": "https://res.cloudinary.com/dotuv0gsf/image/upload/v1736784890/chat-app/wbm4iucmxao4zf5hr0cd.jpg",
            "__v": 0
        },
        {
            "_id": "6785372ca35bc4266975d4d8",
            "name": "Amit Kumar",
            "email": "amit.kumar@example.com",
            "phoneNo": "9876543210",
            "avatarUrl": "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
            "__v": 0
        }
    ],
    "latestMessage": null,
    "createdAt": "2025-01-14T10:40:17.008Z",
    "updatedAt": "2025-01-14T10:40:17.008Z",
    "__v": 0
}
*/
