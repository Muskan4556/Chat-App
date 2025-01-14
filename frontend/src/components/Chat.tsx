import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCreateChat, useGetChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";
import { useGetAllMessages, useSendMessage } from "@/api/message";
import Loader from "./Loader";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Plus, Send } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

const Chat = () => {
  const location = useLocation();
  const { userId } = useAppContext();
  const [currentUserId, setCurrentUserId] = useState(
    location.pathname.split("/")[2]
  );

  const [messageText, setMessageText] = useState("");
  // const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
      setMessageText("");
      messageRefetch();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpload = async (result: any) => {
    if (result?.event === "success") {
      const fileUrl = result?.info?.secure_url;
      const fileType = result?.info?.resource_type; 

      // setAvatarUrl(fileUrl);

      if (chat) {
        await sendMessage({
          chatId: chat._id as string,
          content: fileUrl,
          type: fileType,
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

  if (chatLoading) {
    return <Loader />;
  }

  const currentUserChat = chat?.users?.find((user) => user._id !== userId);

  return (
    <div className="py-6 px-4 space-y-6 w-full bg-gray-50 rounded-lg shadow-lg">
      {currentUserChat && (
        <div className="relative">
          <header className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Avatar className="relative">
              <AvatarImage
                src={currentUserChat.avatarUrl}
                alt="User Avatar"
                className="rounded-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {currentUserChat.name}
          </header>

          <ScrollArea className="flex flex-col bg-white overflow-y-auto rounded-lg p-4 h-96 shadow-md">
            {message?.map((m) => (
              <div
                key={m._id}
                className={`flex flex-col mb-4 ${
                  m.senderId?._id === userId ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`${
                    m.type === "text"
                      ? `px-4 py-2 rounded-lg shadow ${
                          m.senderId?._id === userId
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-black"
                        }`
                      : ""
                  }`}
                >
                  {m?.type === "text" && <p>{m.content}</p>}

                  {m?.type === "image" && (
                    <img
                      src={m.content}
                      alt="Sent image"
                      className="max-w-sm max-h-52 rounded-lg"
                    />
                  )}

                  {m?.type === "video" && (
                    <video
                      src={m.content}
                      controls
                      className="max-w-xs max-h-40 rounded-lg"
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(m.createdAt || "").toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </ScrollArea>

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 mt-4 p-2 bg-white rounded-lg shadow-md"
          >
            <Button
              type="button"
              onClick={handleUploadClick}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Input
              className="flex-grow border-none shadow-none focus:ring-0 focus:outline-none"
              placeholder="Enter a message..."
              onChange={(e) => setMessageText(e.target.value)}
              value={messageText}
            />
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;
