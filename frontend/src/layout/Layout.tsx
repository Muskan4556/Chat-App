import Header from "@/components/Header";
import { useLocation } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export const Layout = ({ children }: Props) => {
  const location = useLocation();
  const isChatPage = location.pathname.includes("/chat/");

  return (
    <div className="flex flex-col h-screen bg-background transition-colors duration-500 overflow-hidden">
      <Header />
      <main className={`
        flex-1 flex flex-col overflow-hidden
        ${!isChatPage && "" }
      `}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

