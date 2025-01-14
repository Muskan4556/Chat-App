import { TMessage } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useSendMessage = () => {
  const sendMessageRequest = async (formData: TMessage) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/message`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  };

  const {
    mutateAsync: sendMessage,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: sendMessageRequest,
    onSuccess: () => {
    //   toast.success("Message created successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
      reset();
    },
  });

  return { sendMessage, status, error };
};

export const useGetAllMessages = (chatId: string) => {
  const fetchAllMessage = async (): Promise<TMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/message/${chatId}`, {
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
    data: message,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["message"],
    queryFn: fetchAllMessage,
  });

  if (error) {
    toast.error(error.toString());
  }

  return { message, isLoading, error, refetch };
};
