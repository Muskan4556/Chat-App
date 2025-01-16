import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCreateChat, useGetChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";
import { useGetAllMessages, useSendMessage } from "@/api/message";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { MessageCircle, Plus, Send } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import io from "socket.io-client";

const Chat = () => {
  const location = useLocation();
  const { userId } = useAppContext();
  const [currentUserId, setCurrentUserId] = useState(
    location.pathname.split("/")[2]
  );
  const [messageText, setMessageText] = useState("");
  const [, setSocketConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);

  const { createChat } = useCreateChat();
  const {
    chat,
    isLoading: chatLoading,
    refetch: chatRefetch,
  } = useGetChat(currentUserId);
  const { sendMessage } = useSendMessage();
  const { message, refetch: messageRefetch } = useGetAllMessages(
    chat?._id as string
  );

  useEffect(() => {
    const newUserId = location.pathname.split("/")[2];
    if (newUserId !== currentUserId) {
      setCurrentUserId(newUserId);
    }
  }, [currentUserId, location.pathname]);

  useEffect(() => {
    const createChatIfNeeded = async () => {
      if (currentUserId && !chat) {
        await createChat(currentUserId);
        chatRefetch();
      } else if (currentUserId && chat) {
        chatRefetch();
        messageRefetch();
      }
    };

    createChatIfNeeded();
  }, [createChat, currentUserId, chat, chatRefetch, messageRefetch]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageText && chat) {
      await sendMessage({
        chatId: chat._id as string,
        content: messageText,
      });
      // Emit the message via socket to the backend
      socketRef.current.emit("send message", {
        chatId: chat._id as string,
        content: messageText,
        senderId: userId,
      });
      setMessageText("");
      messageRefetch();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (result: any) => {
    if (result?.event === "success") {
      let fileUrl = result?.info?.secure_url;
      const fileType = result?.info?.format;

      let contentType = fileType;

      if (fileType === "mp4" || fileType === "mkv") {
        contentType = "video";
      } else if (fileType === "pdf") {
        const transformedUrl = fileUrl.replace(".pdf", ".jpg");
        contentType = "pdf";
        fileUrl = transformedUrl;
      } else if (
        fileType === "jpg" ||
        fileType === "jpeg" ||
        fileType === "png" ||
        fileType === "gif"
      ) {
        contentType = "image";
      }

      if (chat) {
        await sendMessage({
          chatId: chat._id as string,
          content: fileUrl,
          type: contentType,
        });
        socketRef.current.emit("send message", {
          chatId: chat._id as string,
          content: fileUrl,
          senderId: userId,
        });
        messageRefetch();
      }
    }
  };

  const handleUploadClick = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESETS,
        sources: ["local", "url", "camera"],
        cropping: true,
        multiple: false,
        clientAllowedFormats: [
          "jpg",
          "png",
          "jpeg",
          "pdf",
          "doc",
          "mp4",
          "mkv",
        ],
        theme: "minimal",
        maxFileSize: 10000000,
        folder: "chat-app",
        accessMode: "private",
      },
      // @ts-expect-error: Expect an error on the next line
      (error, result) => {
        if (result && result.event === "success") {
          handleUpload(result);
        } else if (error) {
          console.error("Upload Widget Error:", error);
        } else if (
          result?.event === "error" &&
          result?.info?.error?.code === "FILE_TOO_LARGE"
        ) {
          toast.error("File is too large. Please upload a smaller file.");
        }
      }
    );

    widget.open();
  };

  // Socket
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      withCredentials: true,
    });

    socketRef.current.emit("setup", userId);
    socketRef.current.on("connection", () => setSocketConnected(true));

    // Join chat room based on chat ID
    if (chat) {
      socketRef.current.emit("join chat", chat._id);
    }

    // Listen for message received event and update messages in real-time
    socketRef.current.on(
      "message received",
      (newMessage: { chatId: string | undefined }) => {
        if (chat && chat._id === newMessage.chatId) {
          messageRefetch();
        }
      }
    );

    return () => {
      socketRef.current.off("connected");
      socketRef.current.off("message received");
      socketRef.current.disconnect();
    };
  }, [userId, chat, API_BASE_URL, messageRefetch]);

  if (chatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">
          Loading conversation...
        </div>
      </div>
    );
  }

  const currentUserChat = chat?.users?.find((user) => user._id !== userId);

  return (
    <div className="flex-1 flex flex-col h-screen  p-4 bg-gray-100 rounded-lg ">
      {currentUserChat ? (
        <>
          <header className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 shadow-sm rounded-lg rounded-b-none  ">
            <div className="max-w-full sm:max-w-3xl px-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-4 ring-green-100">
                    <AvatarImage
                      src={currentUserChat.avatarUrl}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
                      {currentUserChat.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {currentUserChat.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-green-600">
                    Active now
                  </p>
                </div>
              </div>
            </div>
          </header>

          <ScrollArea className="flex-1 px-4 py-6 bg-white">
            <div className="space-y-6 max-w-full sm:max-w-3xl mx-auto">
              {message?.map((m) => (
                <div
                  key={m._id}
                  className={`flex ${
                    m.senderId?._id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex flex-col max-w-full md:max-w-[70%] space-y-1">
                    <div
                      className={`flex items-end gap-2 ${
                        m.senderId?._id === userId
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      {m.senderId?._id !== userId && (
                        <Avatar className="h-8 w-8 ring-2 ring-green-50">
                          <AvatarImage src={currentUserChat.avatarUrl} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {currentUserChat.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`${
                          m.type === "text"
                            ? `px-4 py-2.5 rounded-2xl shadow-sm ${
                                m.senderId?._id === userId
                                  ? "bg-green-500 text-white rounded-br-sm"
                                  : "bg-white text-gray-900 rounded-bl-sm"
                              }`
                            : ""
                        }`}
                      >
                        {m?.type === "text" && (
                          <p className="text-sm sm:text-base leading-relaxed">
                            {m.content}
                          </p>
                        )}
                        {(m?.type === "image" || m?.type === "pdf") && (
                          <img
                            src={m.content}
                            alt="Sent image"
                            className="rounded-lg max-w-full md:max-w-sm max-h-52 object-cover shadow-md"
                          />
                        )}
                        {m?.type === "video" &&
                          m.content &&
                          (m.content.includes(".mp4") ||
                            m.content.includes(".mkv")) && (
                            <div className="w-full max-w-sm">
                              <video controls>
                                <source src={m.content} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                      </div>
                    </div>
                    <span
                      className={`text-xs text-gray-500 ${
                        m.senderId?._id === userId ? "text-right" : "text-left"
                      } px-2`}
                    >
                      {new Date(m.createdAt || "").toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="md:p-4 bg-white rounded-lg rounded-t-none border-t border-gray-200">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 max-w-full sm:max-w-3xl mx-auto shadow-sm"
            >
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleUploadClick}
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <Input
                className="flex-1 border-none bg-transparent focus-visible:ring-0 focus:shadow-none shadow-none text-gray-700 placeholder:text-gray-400 text-sm focus:outline-none focus:border-none md:placeholder:tracking-normal placeholder:tracking-tighter"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition-colors flex items-center gap-2 w-4"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:p-6 bg-white">
          <div className="bg-green-50 p-6 rounded-full mb-6">
            <MessageCircle className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-3">
            No Conversation Selected
          </h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-sm">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
