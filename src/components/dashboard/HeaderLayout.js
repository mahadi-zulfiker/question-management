"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FiLogOut, FiUser } from "react-icons/fi";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const Header = ({ toggleSidebar }) => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/signIn" });
  };

  return (
    <header className="z-50 fixed top-0 left-0 w-full bg-gradient-to-b from-gray-50 to-white shadow-md h-16">
      <div className="flex items-center justify-between w-full px-4 py-3 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-indigo-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="text-xl font-bold text-indigo-900">
            Dashboard
          </div>
        </div>

        <div className="relative">
          <div
            className="flex items-center gap-2 cursor-pointer bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md hover:shadow-xl transition-all duration-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-base">
              {user?.email ? user.email.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="hidden sm:block text-sm truncate max-w-[150px]">
              {status === "loading" ? (
                <span className="text-gray-500">Loading...</span>
              ) : user ? (
                <span className="font-medium text-gray-800 truncate">{user.email}</span>
              ) : (
                <span className="text-gray-500">Guest</span>
              )}
            </div>
            {isDropdownOpen ? (
              <IoMdArrowDropup className="text-gray-600" />
            ) : (
              <IoMdArrowDropdown className="text-gray-600" />
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/50 animate-fadeInDown">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-500"
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;