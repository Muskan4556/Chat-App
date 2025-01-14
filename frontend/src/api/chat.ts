import { TChat } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateChat = () => {
  const createNewChat = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create chat");
    }

    return response.json();
  };

  const {
    mutateAsync: createChat,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: createNewChat,
    onSuccess: () => {
      //   toast.success("Chat created successfully");
    },
    onError: () => {
      // toast.error(error.toString());
      reset();
    },
  });

  return { createChat, status, error };
};

export const useGetChat = (userId: string) => {
  const fetchChats = async (): Promise<TChat> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/${userId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching chats");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: chat,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["chat"],
    queryFn: fetchChats,
  });

  if (error) {
    toast.error(error.toString());
  }

  return { chat, isLoading, error, refetch };
};

export const useGetAllChat = () => {
  const fetchAllChats = async (): Promise<TChat[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching chats");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: chats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allChats"],
    queryFn: fetchAllChats,
  });

  if (error) {
    toast.error(error.toString());
  }

  return { chats, isLoading, error, refetch };
};
