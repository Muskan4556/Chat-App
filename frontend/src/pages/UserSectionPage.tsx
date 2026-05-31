import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllUsers } from "@/api/user";
import Users from "@/components/Users";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  isSidebar?: boolean;
}

const UserSectionPage = ({ isSidebar = false }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [submittedSearch, setSubmittedSearch] = useState(
    searchParams.get("search") || ""
  );

  const { users, refetch } = useGetAllUsers(submittedSearch);

  const handleSearch = () => {
    setSubmittedSearch(search);
    setSearchParams({ search });
  };

  if (users?.length === 0 && submittedSearch) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 bg-card rounded-[2rem] border border-border/50 shadow-xl max-w-md mx-auto mt-20"
      >
        <div className="bg-primary/5 p-6 rounded-full mb-6">
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No users found</h3>
        <p className="text-muted-foreground text-center mb-6">We couldn't find any users matching "{submittedSearch}".</p>
        <button 
          onClick={() => {
            setSearch("");
            setSubmittedSearch("");
            setSearchParams({});
          }}
          className="text-primary font-bold hover:underline"
        >
          Clear search
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full items-stretch overflow-hidden">
      <Users
        users={users || []}
        refetch={refetch}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
      />
      {!isSidebar && (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-secondary/10 relative overflow-hidden">
           {/* Background subtle pattern */}
           <div className="absolute inset-0 opacity-40 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-5" />
           </div>

           <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ damping: 20, stiffness: 100 }}
              className="text-center p-8 z-10"
           >
              <div className="bg-background p-10 rounded-[4rem] shadow-2xl shadow-primary/10 mb-8 inline-block ring-1 ring-primary/5">
                 <MessageCircle className="h-20 w-20 text-primary" />
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-foreground mb-4">Select a chat to start</h2>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed text-lg">
                 Pick a conversation from the sidebar or search for a new person to connect with.
              </p>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserSectionPage;

