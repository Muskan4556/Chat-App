import React, { createContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useValidateToken } from "@/api/auth";

export type AppContextType = {
  isLoggedIn: boolean;
  validateToken: () => Promise<void>;
  status: "idle" | "pending" | "error" | "success";
  error: Error | null;
  userId: string | null;
  loading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type ContextProviderProps = {
  children: React.ReactNode;
};

export const AppContextProvider = ({ children }: ContextProviderProps) => {
  const { validateToken: validateTokenApi } = useValidateToken();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    mutateAsync: validateToken,
    status,
    error,
    reset,
  } = useMutation({
    mutationFn: validateTokenApi,
    onSuccess: (data) => {
      setIsLoggedIn(true);
      setUserId(data.userId);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", data.userId);
      setLoading(false);
    },
    onError: () => {
      setIsLoggedIn(false);
      setUserId(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");
      setLoading(false);
      reset();
    },
  });

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedUserId = localStorage.getItem("userId");

    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      validateToken().catch(() => {});
    } else {
      setLoading(false);
    }
  }, [validateToken]);

  return (
    <AppContext.Provider
      value={{
        userId,
        isLoggedIn,
        validateToken,
        status,
        error,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
