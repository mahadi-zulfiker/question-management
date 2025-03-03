'use client';
import { MdPerson, MdOutlineAdminPanelSettings } from "react-icons/md";
import { BiHomeAlt, BiBookAdd } from "react-icons/bi";
import { FaUserGraduate, FaChalkboardTeacher, FaPlusCircle } from "react-icons/fa";
import { AiOutlineProfile } from "react-icons/ai";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const isActive = (route) =>
    pathname === route
      ? "bg-[#d9f3ea] text-green-700"
      : "text-gray-800 hover:bg-[#d9f3ea]";

  const commonMenuItems = [
    {
      href: "/",
      icon: <BiHomeAlt className="text-2xl mr-2" />, 
      label: "Back to Home",
    },
  ];

  const getMenuItems = () => {
    if (pathname.startsWith("/dashboard/student")) {
      return [
        ...commonMenuItems,
        {
          href: "/dashboard/student",
          icon: <FaUserGraduate className="text-2xl mr-2" />, 
          label: "Student Profile",
        },
      ];
    } else if (pathname.startsWith("/dashboard/teacher")) {
      return [
        ...commonMenuItems,
        {
          href: "/dashboard/teacher",
          icon: <FaChalkboardTeacher className="text-2xl mr-2" />, 
          label: "Teacher Profile",
        },
        {
          href: "/dashboard/teacher/createMCQTeacher",
          icon: <BiBookAdd className="text-2xl mr-2" />, 
          label: "Create MCQ",
        },
        {
          href: "/dashboard/teacher/createCQTeacher",
          icon: <FaPlusCircle className="text-2xl mr-2" />, 
          label: "Create CQ",
        },
        {
          href: "/dashboard/teacher/createSQTeacher",
          icon: <AiOutlineProfile className="text-2xl mr-2" />, 
          label: "Create SQ",
        },
      ];
    } else if (pathname.startsWith("/dashboard/admin")) {
      return [
        ...commonMenuItems,
        {
          href: "/dashboard/admin/adminProfileManagement",
          icon: <MdOutlineAdminPanelSettings className="text-2xl mr-2" />, 
          label: "Profile Management",
        },
        {
          href: "/dashboard/admin/createMCQAdmin",
          icon: <BiBookAdd className="text-2xl mr-2" />, 
          label: "Create MCQ",
        },
        {
          href: "/dashboard/admin/createCQAdmin",
          icon: <FaPlusCircle className="text-2xl mr-2" />, 
          label: "Create CQ",
        },
        {
          href: "/dashboard/admin/createSQAdmin",
          icon: <AiOutlineProfile className="text-2xl mr-2" />, 
          label: "Create SQ",
        },
        {
          href: "/dashboard/admin/createPackage",
          icon: <AiOutlineProfile className="text-2xl mr-2" />, 
          label: "Create Package",
        },
      ];
    } else {
      return commonMenuItems;
    }
  };

  return (
    <nav
      id="sidebar"
      className={`lg:min-w-[250px] w-max max-lg:min-w-8 transition-all duration-500 ease-in-out ${
        isSidebarOpen ? "w-max" : "max-lg:w-0 max-lg:invisible"
      }`}
    >
      <div
        id="sidebar-collapse-menu"
        className="bg-white shadow-lg h-screen fixed top-0 left-0 overflow-auto z-[99]"
      >
        <div className="pt-8 pb-2 px-6 sticky top-0 bg-white min-h-[80px] z-[100]">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            className="lg:hidden"
          />
        </div>
        <div className="py-6 px-6">
          <ul className="space-y-2">
            {getMenuItems().map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`menu-item text-sm flex items-center cursor-pointer rounded-md px-3 py-3 transition-all duration-300 ${isActive(item.href)}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;