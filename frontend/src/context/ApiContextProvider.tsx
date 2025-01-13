import React, { createContext, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useValidateToken } from "@/api/auth";

export type AppContextType = {
  isLoggedIn: boolean;
  validateToken: () => Promise<void>;
  status: "idle" | "pending" | "error" | "success";
  error: Error | null;
  userRole: string | null;
  loading: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type ContextProviderProps = {
  children: React.ReactNode;
};

export const AppContextProvider = ({ children }: ContextProviderProps) => {
  const { validateToken: validateTokenApi } = useValidateToken();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
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
      setUserRole(data.userRole);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.userRole);
      setLoading(false); 
    },
    onError: () => {
      setIsLoggedIn(false);
      setUserRole(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      setLoading(false); 
      reset();
    },
  });

  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    const storedUserRole = localStorage.getItem("userRole");

    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
      setUserRole(storedUserRole);
      validateToken().catch(() => {});
    } else {
      setLoading(false); 
    }
  }, [validateToken]);

  return (
    <AppContext.Provider
      value={{
        userRole,
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
