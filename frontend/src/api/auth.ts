import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TLogin } from "@/components/Login";
import { TSignup } from "@/components/SignUp";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useCreateNewUser = () => {
  const createNewUser = async (formData: TSignup) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create account");
    }

    return response.json();
  };

  const {
    mutateAsync: registerUser,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: createNewUser,
    onSuccess: () => {
      toast.success("Account created successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
      reset();
    },
  });

  return { registerUser, status, error };
};

export const useLoginUser = () => {
  const loginUser = async (formData: TLogin) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      // const errorData = await response.json();
      throw new Error("Invalid credentials");
    }

    return response.json();
  };

  const {
    mutateAsync: login,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("Logged in successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
      reset();
    },
  });

  return { login, status, error };
};

export const useLogout = () => {
  const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to logout");
    }

    return await response.json();
  };

  const {
    mutateAsync: logoutUser,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.toString());
      reset();
    },
  });

  return { logoutUser, status, error };
};

export const useValidateToken = () => {
  const validateUser = async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/validate-token`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Token invalid");
    }

    return await response.json();
  };

  const {
    mutateAsync: validateToken,
    status,
    error,
  } = useMutation({
    mutationFn: validateUser,
  });

  return { validateToken, status, error };
};
