import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllUsers } from "@/api/user";
import Users from "@/components/Users";
import { MessageCircle } from "lucide-react";

const UserSectionPage = () => {
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

  if (users?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg  shadow-md">
        <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">No users found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center relative p-4 bg-gray-100 rounded-lg min-h-screen w-96">
      <Users
        users={users || []}
        refetch={refetch}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
      />
    </div>
  );
};

export default UserSectionPage;
