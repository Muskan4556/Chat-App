import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllUsers } from "@/api/user";
import Users from "@/components/Users";

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
    return <p className="p-4">No users found</p>;
  }

  return (
    <div className="flex gap-4 relative ">
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
