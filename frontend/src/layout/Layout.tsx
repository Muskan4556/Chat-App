import Footer from "@/components/Footer";
import Header from "@/components/Header";

type Props = {
  children: React.ReactNode;
  showHero?: boolean;
};

export const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen ">
      <Header />
      <div className="container mx-auto flex-1 py-10 md:px-10 px-6">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
