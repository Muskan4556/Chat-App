import { useLocation } from "react-router-dom";

import Login from "@/components/Login";
import Signup from "@/components/SignUp";

const AuthPage = () => {
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-12 bg-secondary/10">
     {location.pathname === "/auth/signup" ? <Signup /> : <Login />}
    </div>
  );
};

export default AuthPage;
