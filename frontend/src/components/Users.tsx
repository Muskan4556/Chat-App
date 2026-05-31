import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { MessageCircle, Search, MoreVertical, Plus } from "lucide-react";
import { TUser } from "@/types";
import { Link, useParams } from "react-router-dom";
import { useGetAllChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";
import { ScrollArea } from "./ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  users: TUser[];
  refetch: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

const Users = ({ users, search, onSearchChange, onSearchSubmit }: Props) => {
  const { userId } = useAppContext();
  const { userId: activeUserId } = useParams();
  const { chats } = useGetAllChat();
  
  const filteredChatData = chats?.map((chat) => {
    if (chat.users) {
      const otherUser = chat.users.find((user) => user._id !== userId);
      if (otherUser) {
        return {
          ...chat,
          users: [otherUser],
        };
      }
    }
    return chat;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col h-full overflow-hidden shadow-xl z-10 transition-all duration-300">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Connect with your network</p>
          </div>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-6 bg-secondary/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
          />
        </form>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-6">
          <AnimatePresence mode="popLayout">
            {users?.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-40 text-center px-4"
              >
                <div className="bg-muted p-4 rounded-full mb-3">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No conversations found</p>
              </motion.div>
            ) : (
              [...(users || [])].sort((a, b) => {
                const chatA = filteredChatData?.find(c => c.users?.some(u => u._id === a._id));
                const chatB = filteredChatData?.find(c => c.users?.some(u => u._id === b._id));
                
                const timeA = chatA?.latestMessage ? new Date(chatA.updatedAt).getTime() : 0;
                const timeB = chatB?.latestMessage ? new Date(chatB.updatedAt).getTime() : 0;
                
                return timeB - timeA;
              }).map((user, index) => {
                const chat = filteredChatData?.find((chat) =>
                  chat.users?.some((u) => u._id === user._id)
                );
                const latestMessage = chat?.latestMessage;
                const isActive = activeUserId === user._id;

                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/chat/${user._id}`}
                      className="block group"
                    >
                      <div className={`
                        flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 relative
                        ${isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] z-10" 
                          : "hover:bg-secondary/80 text-foreground"
                        }
                      `}>
                        <div className="relative">
                          <Avatar className={`
                            h-12 w-12 border-2 transition-transform duration-300 group-hover:scale-105
                            ${isActive ? "border-primary-foreground/30" : "border-background ring-2 ring-primary/5"}
                          `}>
                            <AvatarImage
                              src={user?.avatarUrl}
                              className="object-cover"
                            />
                            <AvatarFallback className={isActive ? "bg-primary-foreground/10 text-primary-foreground" : "bg-primary/10 text-primary"}>
                              {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`
                            absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full ring-2 
                            ${isActive ? "bg-primary-foreground ring-primary" : "bg-green-500 ring-white"}
                          `} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <h3 className={`font-semibold truncate ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                              {user.name}
                            </h3>
                            {latestMessage && (
                              <span className={`text-[10px] font-medium uppercase tracking-tighter ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {new Date(chat.updatedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {latestMessage?.type === "text" ? (
                              latestMessage.content
                            ) : latestMessage?.type === "image" ||
                              latestMessage?.type === "video" ||
                              latestMessage?.type === "doc" ? (
                              <span className="flex items-center gap-1 italic">
                                <Plus className="h-3 w-3" /> File attached
                              </span>
                            ) : (
                              <span className={isActive ? "text-primary-foreground/60" : "text-primary font-medium"}>Start a new conversation</span>
                            )}
                          </p>
                        </div>
                        {isActive && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute -left-1 top-4 bottom-4 w-1 bg-white rounded-full"
                          />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
export default Users;

