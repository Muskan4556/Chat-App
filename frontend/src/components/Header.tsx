import { useLogout } from "@/api/auth";
import { useGetUser } from "@/api/user";
import { useAppContext } from "@/context/useAppContext";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Header = () => {
  const { isLoggedIn, validateToken, userId } = useAppContext();
  const { logoutUser } = useLogout();
  const navigate = useNavigate();
  const { user, isLoading } = useGetUser(userId as string);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (userId === user?._id) {
        setAvatarUrl(user?.avatarUrl as string);
      }
    }
  }, [user, userId, avatarUrl, isLoading]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/auth/login");
    await validateToken();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-green-600 text-white pl-6 pr-8 py-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to={"/"} className="ml-3 text-xl md:text-2xl font-semibold">
            WebChat
          </Link>
        </div>
        <nav className="space-x-6">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4 relative">
              <Link to={`/profile`}>
                <motion.div
                  className="cursor-pointer rounded-full border-2 border-gradient-to-r from-green-500 via-yellow-500 to-pink-500 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="relative">
                    <AvatarImage
                      src={avatarUrl as string}
                      alt="User Avatar"
                      className="rounded-full"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </motion.div>
              </Link>
              <div
                onClick={handleLogout}
                className="hover:text-gray-200 hover:underline font-semibold cursor-pointer md:text-lg"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <LogOut />{" "}
                    </TooltipTrigger>
                    <TooltipContent className="mt-4">
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="hover:text-gray-200 hover:underline font-semibold cursor-pointer md:text-lg"
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
