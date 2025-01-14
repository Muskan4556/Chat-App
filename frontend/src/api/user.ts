import { TUser } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetAllUsers = (search: string) => {
  const fetchAllUsers = async (): Promise<TUser[]> => {
    const url = new URL(`${API_BASE_URL}/api/v1/user`);
    if (search) {
      url.searchParams.append("search", search);
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching users");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", search],
    queryFn: fetchAllUsers,
  });

  if (error) {
    toast.error(error.toString());
  }

  return { users, isLoading, error, refetch };
};

export const useGetUser = (id: string) => {
  const fetchUser = async (): Promise<TUser> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/${id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching user");
    }
    const data = await response.json();
    return data;
  };

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  if (error) {
    // toast.error(error.toString());
  }

  return { user, isLoading, error, refetch };
};

export const useUpdateUser = () => {
  const updateDeliveryStaffRequest = async (data: {
    id: string;
    formData: TUser;
  }): Promise<TUser> => {
    const { id, formData } = data;
    const updatedFormData = {
      ...formData,
      id,
    };
    const response = await fetch(`${API_BASE_URL}/api/v1/user/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFormData),
    });

    if (!response.ok) {
      throw new Error("Error updating user");
    }

    return response.json();
  };

  const {
    mutateAsync: updateUser,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: updateDeliveryStaffRequest,
    onSuccess: () => {
      toast.success("user updated successfully");
    },
    onError: () => {
      toast.error("Error updating user");
      reset();
    },
  });

  return { updateUser, status, error };
};

export const useDeleteUser = () => {
  const deleteUserRequest = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/${userId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error deleting user");
    }

    return response.json();
  };

  const {
    mutateAsync: deleteUser,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () => {
      toast.success("User deleted successfully");
    },
    onError: () => {
      toast.error("Error deleting user");
      reset();
    },
  });

  return { deleteUser, status, error };
};
