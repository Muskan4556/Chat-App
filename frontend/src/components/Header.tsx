import { queryClient } from "@/main";
import { useLogout } from "@/api/auth";
import { useGetUser } from "@/api/user";
import { useAppContext } from "@/context/useAppContext";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut, Settings, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

const Header = () => {
  const { isLoggedIn, userId, logout } = useAppContext();
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
    logout();
    queryClient.clear();
    navigate("/auth/login");
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <Link to={"/"} className="text-xl font-black tracking-tighter text-foreground group transition-all">
            Web<span className="text-primary group-hover:text-primary/80">Chat</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <div className="flex items-center gap-1 bg-secondary/50 p-1.5 rounded-full px-4 border border-border/50">
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/profile" className="flex items-center gap-2 group">
                        <Avatar className="h-8 w-8 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={avatarUrl as string} />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors hidden md:block">
                          {user?.name?.split(' ')[0]}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Profile Settings</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-1">
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>App Settings</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className="rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center gap-2 px-3"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Logout</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Sign out</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Get Started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

