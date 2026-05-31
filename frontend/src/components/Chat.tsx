import { useEffect, useRef, useState, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { useCreateChat, useGetChat } from "@/api/chat";
import { useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "@/context/useAppContext";
import { useGetAllMessages, useSendMessage } from "@/api/message";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { MessageCircle, Plus, Send, Phone, Video, Info, Smile, Paperclip, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { createChat } = useCreateChat();
  const {
    chat,
    isLoading: chatLoading,
    refetch: chatRefetch,
  } = useGetChat(currentUserId);
  const { sendMessage } = useSendMessage();
  const { message: messages, refetch: messageRefetch } = useGetAllMessages(
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (messageText && chat) {
      await sendMessage({
        chatId: chat._id as string,
        content: messageText,
      });
      socketRef.current.emit("send message", {
        chatId: chat._id as string,
        content: messageText,
        senderId: userId,
      });
      setMessageText("");
      messageRefetch();
      queryClient.invalidateQueries({ queryKey: ["allChats"] });
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESETS);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        const fileUrl = data.secure_url;
        const fileType = data.format || file.type.split("/")[1];
        let contentType = "text";

        if (file.type.startsWith("video/")) {
          contentType = "video";
        } else if (fileType === "pdf") {
          contentType = "pdf";
        } else if (file.type.startsWith("image/")) {
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
          queryClient.invalidateQueries({ queryKey: ["allChats"] });
          toast.success("File uploaded successfully");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10000000) {
        toast.error("File is too large (max 10MB)");
        return;
      }
      handleUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      withCredentials: true,
    });

    socketRef.current.emit("setup", userId);
    socketRef.current.on("connection", () => setSocketConnected(true));

    if (chat) {
      socketRef.current.emit("join chat", chat._id);
    }

    socketRef.current.on(
      "message received",
      (newMessage: { chatId: string | undefined }) => {
        if (chat && chat._id === newMessage.chatId) {
          messageRefetch();
          queryClient.invalidateQueries({ queryKey: ["allChats"] });
        }
      }
    );

    return () => {
      socketRef.current.off("connected");
      socketRef.current.off("message received");
      socketRef.current.disconnect();
    };
  }, [userId, chat, API_BASE_URL, messageRefetch, queryClient]);

  if (chatLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm h-screen">
        <motion.div
           animate={{ 
             scale: [1, 1.1, 1],
             opacity: [0.5, 1, 0.5]
           }}
           transition={{ 
             repeat: Infinity,
             duration: 2
           }}
           className="flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Syncing conversation...</p>
        </motion.div>
      </div>
    );
  }

  const currentUserChat = chat?.users?.find((user) => user._id !== userId);

  return (
    <div className="flex-1 flex flex-col h-full bg-secondary/30 relative overflow-hidden backdrop-blur-3xl">
      {currentUserChat ? (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentUserChat._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-full"
          >
            {/* Chat Header */}
            <header className="px-4 py-4 bg-background/80 glass border-b border-border shadow-sm z-20">
              <div className="flex items-center justify-between mx-auto w-full gap-2">
                <div className="flex items-center gap-3">
                  <Link to="/" className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  <div className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative">
                    <Avatar className="h-11 w-11 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                      <AvatarImage
                        src={currentUserChat.avatarUrl}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {currentUserChat.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background shadow-lg" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground leading-none mb-1 group-hover:text-primary transition-colors">
                      {currentUserChat.name}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] uppercase tracking-wider font-bold text-green-600/80">
                        Online
                      </p>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-8 relative">
              {/* Background Decoration */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl opacity-30" />
              </div>

              <div className="space-y-8 max-w-4xl mx-auto pb-4">
                {messages?.map((m, idx) => {
                  const isMe = m.senderId?._id === userId;
                  const showAvatar = idx === 0 || messages[idx-1].senderId?._id !== m.senderId?._id;
                  
                  return (
                    <motion.div
                      key={m._id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3`}
                    >
                      {!isMe && (
                        <div className="w-8">
                          {showAvatar ? (
                            <Avatar className="h-8 w-8 ring-2 ring-primary/5">
                              <AvatarImage src={currentUserChat.avatarUrl} />
                              <AvatarFallback>{currentUserChat.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ) : <div className="w-8" />}
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`
                            relative px-4 py-3 rounded-2xl chat-bubble-shadow transition-all group
                            ${isMe 
                               ? "bg-primary text-primary-foreground rounded-br-none" 
                               : "bg-background text-foreground rounded-bl-none"
                            }
                          `}
                        >
                          {m?.type === "text" && (
                            <p className="text-sm md:text-[15px] leading-relaxed font-normal">
                              {m.content}
                            </p>
                          )}
                          {(m?.type === "image" || m?.type === "pdf") && (
                            <div className="relative overflow-hidden rounded-lg group shadow-sm">
                              <img
                                src={m.content}
                                alt="Shared asset"
                                className="max-w-full md:max-w-sm max-h-64 object-cover transition-transform group-hover:scale-105 duration-500"
                              />
                            </div>
                          )}
                          {m?.type === "video" && m.content && (
                            <div className="w-full max-w-sm rounded-lg overflow-hidden border border-border shadow-sm">
                              <video controls className="w-full">
                                <source src={m.content} type="video/mp4" />
                              </video>
                            </div>
                          )}
                          
                          <div className={`
                            flex items-center justify-end gap-1.5 mt-1
                          `}>
                             <span className={`text-[10px] font-bold uppercase tracking-tighter ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                                {new Date(m.createdAt || "").toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                             </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Footer */}
            <div className="p-4 md:p-6 bg-background/80 glass border-t border-border z-20 sticky bottom-0">
              <form
                onSubmit={handleSendMessage}
                className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3"
              >
                <div className="flex">
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,video/*,.pdf"
                   />
                   <Button
                    type="button"
                    onClick={handleUploadClick}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 md:h-11 md:w-11 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 relative flex items-center bg-secondary/50 rounded-2xl border-2 border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all px-3 md:px-4 py-0.5 md:py-1 group">
                   <Smile className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary/50 transition-colors mr-2 cursor-pointer hidden sm:block" />
                   <Input
                    className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none text-foreground placeholder:text-muted-foreground/40 h-9 md:h-10 text-sm md:text-base"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Paperclip className="h-5 w-5 text-muted-foreground/50 group-focus-within:text-primary/50 transition-colors ml-2 cursor-pointer hover:text-primary/80" />
                </div>

                <Button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50 flex-shrink-0"
                  size="icon"
                >
                  <Send className="h-5 w-5 text-primary-foreground" />
                </Button>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-background/40 backdrop-blur-lg h-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="bg-primary/10 p-8 rounded-[2.5rem] mb-8 shadow-inner ring-1 ring-primary/20">
              <MessageCircle className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">
              Your conversations
            </h3>
            <p className="text-muted-foreground max-w-sm leading-relaxed font-medium">
              Select a chat from the sidebar to start a secure encryption-supported conversation.
            </p>
            <div className="mt-10 flex gap-4">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-1.5 w-8 bg-primary/10 rounded-full" />
               ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Chat;

