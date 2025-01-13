import { useLocation } from "react-router-dom";

import Login from "@/components/Login";
import Signup from "@/components/SignUp";

const AuthPage = () => {
  const location = useLocation();

  return (
    <div>
     {location.pathname === "/auth/signup" ? <Signup /> : <Login />}
    </div>
  );
};

export default AuthPage;
