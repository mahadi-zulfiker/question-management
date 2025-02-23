"use client";

import { useSession } from "next-auth/react";
import { CiSearch } from "react-icons/ci";

const Header = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="z-50 bg-[#f7f6f9] sticky top-0 pt-8">
      <div className="flex flex-wrap items-center w-full relative tracking-wide">
        <div className="flex items-center gap-y-6 max-sm:flex-col z-50 w-full pb-2">
          <div className="flex items-center gap-4 w-full px-6 bg-white shadow-sm min-h-[48px] sm:mr-20 rounded-md outline-none border-none">
            <input
              type="text"
              placeholder="Search something..."
              className="w-full text-sm bg-transparent rounded outline-none"
            />
            <CiSearch className="text-xl" />
          </div>

          <div className="flex gap-2 items-center self-center">
            <div className="px-2 border rounded-full uppercase bg-gray-400 text-white">
              {user?.email ? user.email.charAt(0) : "?"}
            </div>
            <div className="text-sm">
              {status === "loading"
                ? "Loading..."
                : user
                ? `${user.email} - ${user.userType || "No Type Listed"}`
                : "Guest"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
