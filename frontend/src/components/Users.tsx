import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { TUser } from "@/types";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useGetAllChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";

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
    <div className="p-6 space-y-6 w-full sm:w-[400px] bg-gray-50 rounded-md shadow-md">
      <form
        className="relative mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500" />
        <Input
          type="text"
          placeholder="Search user..."
          className="pl-12 py-2 rounded-lg border-gray-300 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Button variant={"outline"} type="submit">
          Search
        </Button>
      </form>
      <div className="max-h-[500px] space-y-4 scroll-thin">
        {users.map((user) => {
          const chat = filteredChatData?.find((chat) =>
            chat.users?.some((u) => u._id === user._id)
          );
          const latestMessage = chat?.latestMessage;
          return (
            <Link to={`/chat/${user._id as string}`}>
              <div
                key={user._id}
                className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-xl transition duration-300 ease-in-out cursor-pointer hover:bg-green-50 my-4"
              >
                <Avatar className="w-14 h-14 border-2 border-green-400 shadow-md">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {latestMessage
                      ? latestMessage.content
                      : "Tap to start a conversation"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Users;
