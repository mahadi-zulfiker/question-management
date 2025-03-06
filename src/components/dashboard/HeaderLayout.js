"use client";

import { useSession } from "next-auth/react";

const Header = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="z-50 bg-[#f7f6f9] sticky top-0 pt-8">
      <div className="flex flex-wrap items-center w-full relative tracking-wide">
        <div className="flex items-center gap-y-6 max-sm:flex-col z-50 w-full pb-2">

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
