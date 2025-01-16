import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { MessageCircle, Search } from "lucide-react";
import { TUser } from "@/types";
import { Link } from "react-router-dom";
import { useGetAllChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";
import { ScrollArea } from "./ui/scroll-area";

type Props = {
  users: TUser[];
  refetch: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

const Users = ({ users, search, onSearchChange, onSearchSubmit }: Props) => {
  const { userId } = useAppContext();
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
    <div className="w-96  border-r border-gray-200 bg-white flex items-start flex-col h-screen rounded-lg">
      <div className="p-6 border-b border-gray-100 ">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <p className="text-sm text-gray-500">Connect with your network</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-green-500"
          />
        </form>
      </div>

      <ScrollArea className="flex-1 px-3 w-full">
        <div className="py-4">
          {users?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <MessageCircle className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-gray-600">No conversations found</p>
            </div>
          ) : (
            users.map((user) => {
              const chat = filteredChatData?.find((chat) =>
                chat.users?.some((u) => u._id === user._id)
              );
              const latestMessage = chat?.latestMessage;

              return (
                <Link
                  to={`/chat/${user._id}`}
                  key={user._id}
                  className="block mb-2"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200">
                    <Avatar className="h-12 w-12 ring-2 ring-green-100">
                      <AvatarImage
                        src={user?.avatarUrl}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </h3>
                        {latestMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(chat.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {latestMessage?.type === "text" ? (
                          latestMessage.content
                        ) : latestMessage?.type === "image" ||
                          latestMessage?.type === "video" ||
                          latestMessage?.type === "doc" ? (
                          "File..."
                        ) : (
                          <div className="text-green-500">Start a new conversation</div>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
export default Users;
