'use client';
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./SidebarLayout";
import Header from "./HeaderLayout";
import Admin from "./Admin";
import AdminProfileManagement from "./Admin/AdminProfileManagement";
import Student from "./Student";
import Teacher from "./Teacher";
import CreateMCQAdmin from "./Admin/CreateMCQAdmin";
import CreateCQAdmin from "./Admin/CreateCQAdmin";
import CreateSQAdmin from "./Admin/CreateSQAdmin";
import CreateMCQTeacher from "./Teacher/CreateMCQTeacher";
import CreateCQTeacher from "./Teacher/CreateCQTeacher";
import CreateSQTeacher from "./Teacher/CreateSQTeacher";
import CreatePackage from "./Admin/CreatePackage";


const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const pathname = usePathname();

  return (
    <div className="relative bg-[#f7f6f9] h-full min-h-screen font-[sans-serif]">
      <div className="flex items-start">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Sidebar toggle button */}
        <button
          id="toggle-sidebar"
          onClick={toggleSidebar}
          className="lg:hidden w-8 h-8 z-[100] fixed top-[36px] left-[10px] cursor-pointer bg-[#007bff] flex items-center justify-center rounded-full outline-none transition-all duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" className="w-3 h-3" viewBox="0 0 55.752 55.752">
            <path d="M43.006 23.916a5.36 5.36 0 0 0-.912-.727L20.485 1.581a5.4 5.4 0 0 0-7.637 7.638l18.611 18.609-18.705 18.707a5.398 5.398 0 1 0 7.634 7.635l21.706-21.703a5.35 5.35 0 0 0 .912-.727 5.373 5.373 0 0 0 1.574-3.912 5.363 5.363 0 0 0-1.574-3.912z" />
          </svg>
        </button>

        {/* Main Content */}
        <section className="main-content w-full px-8">
          <Header toggleDropdown={toggleDropdown} isDropdownOpen={isDropdownOpen} />

          {/* Content based on route */}
          <div className="mt-8">

            {pathname === "/dashboard/student" && <Student/>}

            {pathname === "/dashboard/teacher" && <Teacher />}
            {pathname === "/dashboard/teacher/createMCQTeacher" && <CreateMCQTeacher/>}
            {pathname === "/dashboard/teacher/createCQTeacher" && <CreateCQTeacher />}
            {pathname === "/dashboard/teacher/createSQTeacher" && <CreateSQTeacher/>}

            {pathname === "/dashboard/admin" && <Admin />}
            {pathname === "/dashboard/admin/adminProfileManagement" && <AdminProfileManagement />}
            {pathname === "/dashboard/admin/createMCQAdmin" && <CreateMCQAdmin />}
            {pathname === "/dashboard/admin/createCQAdmin" && <CreateCQAdmin />}
            {pathname === "/dashboard/admin/createSQAdmin" && <CreateSQAdmin />}
            {pathname === "/dashboard/admin/createPackage" && <CreatePackage />}

          </div>

        </section>
      </div>
    </div>
  );
};

export default MainLayout;
