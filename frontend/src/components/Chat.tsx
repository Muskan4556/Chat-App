import { useCreateChat, useGetChat } from "@/api/chat";
import { useAppContext } from "@/context/useAppContext";
import { TUser } from "@/types";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const location = useLocation();
  const { userId } = useAppContext();
  const [currentUserId, setCurrentUserId] = useState(
    location.pathname.split("/")[2]
  );

  // const { user, isLoading, refetch: userRefetch } = useGetUser(currentUserId);
  const { createChat } = useCreateChat();
  const {
    chat,
    isLoading: chatLoading,
    refetch: chatRefetch,
  } = useGetChat(currentUserId);

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
      }
    };
  
    createChatIfNeeded();
  }, [createChat, currentUserId, chat, chatRefetch]);
  

  if (chatLoading) {
    return <Loader />;
  }

  const currentUserChat: TUser | undefined = chat?.users?.find(
    (user) => user._id !== userId
  );

  return (
    <div className="p-6 space-y-6 w-full bg-gray-50 rounded-md shadow-md">
      {currentUserChat && (
        <div>
          <header>{currentUserChat.name}</header>
          <div>hello</div>
        </div>
      )}
    </div>
  );
};

export default Chat;
