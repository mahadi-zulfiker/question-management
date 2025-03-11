'use client';
import { useState } from 'react';
import { MdAdminPanelSettings, MdExpandMore, MdExpandLess } from "react-icons/md";
import { BiHomeSmile, BiBookBookmark, BiMoney } from "react-icons/bi";
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaRegIdBadge, FaUsers } from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { GiNotebook } from "react-icons/gi";
import { TbCertificate, TbListDetails } from "react-icons/tb";
import { AiOutlineFileAdd, AiOutlineProfile, AiOutlineEye } from "react-icons/ai";
import { RiTeamLine, RiQuestionnaireLine, RiBookReadLine } from "react-icons/ri";
import { IoMdCreate } from "react-icons/io";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState({});

  const isActive = (route) =>
    pathname === route
      ? "bg-[#d9f3ea] text-green-700"
      : "text-gray-800 hover:bg-[#d9f3ea]";

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const commonMenuItems = [
    {
      href: "/",
      icon: <BiHomeSmile className="text-2xl mr-2" />,
      label: "Back to Home",
    },
  ];

  const getMenuItems = () => {
    if (pathname.startsWith("/dashboard/student")) {
      return [
        ...commonMenuItems,
        // Student Profile Segment
        { section: "Profile", items: [
          { href: "/dashboard/student/studentProfile", icon: <FaUserGraduate className="text-2xl mr-2" />, label: "Student Profile" },
        ]},
        // Exams Segment
        { section: "Exams", items: [
          { href: "/dashboard/student/viewExams", icon: <TbListDetails className="text-2xl mr-2" />, label: "View Exams" },
          { href: "/dashboard/student/attendedExams", icon: <RiBookReadLine className="text-2xl mr-2" />, label: "Attended Exams" },
        ]},
        // Progress Segment
        { section: "Progress", items: [
          { href: "/dashboard/student/certificates", icon: <TbCertificate className="text-2xl mr-2" />, label: "Certificates" },
          { href: "/dashboard/student/marksHistory", icon: <GiNotebook className="text-2xl mr-2" />, label: "Marks History" },
        ]},
        // Payment Segment
        { section: "Payment", items: [
          { href: "/dashboard/student/paymentHistoryStudent", icon: <BiMoney className="text-2xl mr-2" />, label: "Payment History" },
        ]},
      ];
    } else if (pathname.startsWith("/dashboard/teacher")) {
      return [
        ...commonMenuItems,
        // Teacher Profile Segment
        { section: "Profile", items: [
          { href: "/dashboard/teacher/teacherProfile", icon: <FaChalkboardTeacher className="text-2xl mr-2" />, label: "Teacher Profile" },
        ]},
        // Creation Segment
        { section: "Create", items: [
          { href: "/dashboard/teacher/createMCQTeacher", icon: <IoMdCreate className="text-2xl mr-2" />, label: "Create MCQ" },
          { href: "/dashboard/teacher/createCQTeacher", icon: <FaPlus className="text-2xl mr-2" />, label: "Create CQ" },
          { href: "/dashboard/teacher/createSQTeacher", icon: <AiOutlineFileAdd className="text-2xl mr-2" />, label: "Create SQ" },
          { href: "/dashboard/teacher/createCertificate", icon: <TbCertificate className="text-2xl mr-2" />, label: "Create Certificate" },
        ]},
        // Class Segment
        { section: "Class", items: [
          { href: "/dashboard/teacher/createStudentCircle", icon: <RiTeamLine className="text-2xl mr-2" />, label: "Create Student Circle" },
          { href: "/dashboard/teacher/viewCircle", icon: <AiOutlineProfile className="text-2xl mr-2" />, label: "View Circle" },
        ]},
        // View Segment
        { section: "View", items: [
          { href: "/dashboard/teacher/viewQuestions", icon: <RiQuestionnaireLine className="text-2xl mr-2" />, label: "View Questions" },
          { href: "/dashboard/teacher/viewCertificate", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "View Certificate" },
        ]},
        // Payment Segment
        { section: "Payment", items: [
          { href: "/dashboard/teacher/affiliateTeacher", icon: <FaUsers className="text-2xl mr-2" />, label: "Affiliate Teacher" },
          { href: "/dashboard/teacher/paymentHistory", icon: <BiMoney className="text-2xl mr-2" />, label: "Payment History" },
        ]},
      ];
    } else if (pathname.startsWith("/dashboard/admin")) {
      return [
        ...commonMenuItems,
        // Admin Profile Segment
        { section: "Profile", items: [
          { href: "/dashboard/admin/adminProfileManagement", icon: <MdAdminPanelSettings className="text-2xl mr-2" />, label: "Profile Management" },
          { href: "/dashboard/admin/userManagement", icon: <FaUsers className="text-2xl mr-2" />, label: "User Management" },
        ]},
        // Creation Segment
        { section: "Create", items: [
          { href: "/dashboard/admin/createMCQAdmin", icon: <IoMdCreate className="text-2xl mr-2" />, label: "Create MCQ" },
          { href: "/dashboard/admin/createCQAdmin", icon: <FaPlus className="text-2xl mr-2" />, label: "Create CQ" },
          { href: "/dashboard/admin/createSQAdmin", icon: <AiOutlineFileAdd className="text-2xl mr-2" />, label: "Create SQ" },
          { href: "/dashboard/admin/createPackage", icon: <TbListDetails className="text-2xl mr-2" />, label: "Create Package" },
          { href: "/dashboard/admin/createClass", icon: <RiTeamLine className="text-2xl mr-2" />, label: "Create Class" },
          { href: "/dashboard/admin/createCertificateAdmin", icon: <TbCertificate className="text-2xl mr-2" />, label: "Create Certificate" },
          { href: "/dashboard/admin/createModelTest", icon: <BiBookBookmark className="text-2xl mr-2" />, label: "Create Model Test" },
          { href: "/dashboard/admin/createAdmissionTest", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "Create Admission Test" },
          { href: "/dashboard/admin/createQuestionBank", icon: <GiNotebook className="text-2xl mr-2" />, label: "Create Question Bank" },
        ]},
        // View Segment
        { section: "View", items: [
          { href: "/dashboard/admin/viewQuestionsAdmin", icon: <RiQuestionnaireLine className="text-2xl mr-2" />, label: "View Questions" },
          { href: "/dashboard/admin/teacherQuestions", icon: <AiOutlineEye className="text-2xl mr-2" />, label: "Teacher Questions" },
          { href: "/dashboard/admin/viewCertificateAdmin", icon: <TbCertificate className="text-2xl mr-2" />, label: "View Certificate" },
          { href: "/dashboard/admin/viewModelTest", icon: <BiBookBookmark className="text-2xl mr-2" />, label: "View Model Test" },
          { href: "/dashboard/admin/viewAdmissionTest", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "View Admission Test" },
          { href: "/dashboard/admin/viewQuestionBank", icon: <GiNotebook className="text-2xl mr-2" />, label: "View Question Bank" },
        ]},
        // Payment Segment
        { section: "Payment", items: [
          { href: "/dashboard/admin/affiliateAdmin", icon: <FaUsers className="text-2xl mr-2" />, label: "Affiliate" },
          { href: "/dashboard/admin/priceSetQuestions", icon: <BiMoney className="text-2xl mr-2" />, label: "Pricing Questions" },
          { href: "/dashboard/admin/paymentHistoryAll", icon: <HiOutlineReceiptRefund className="text-2xl mr-2" />, label: "Payment History" },
        ]},
      ];
    }
    return commonMenuItems;
  };

  const renderMenuItem = (item, index) => (
    <li key={index}>
      <Link href={item.href} className={`menu-item flex items-center rounded-md px-3 py-3 transition-all duration-300 ${isActive(item.href)}`}>
        {item.icon}
        <span>{item.label}</span>
      </Link>
    </li>
  );

  const renderSection = (section, items, index) => (
    <li key={index}>
      <div 
        className="menu-item flex items-center rounded-md px-3 py-3 transition-all duration-300 text-gray-800 hover:bg-[#d9f3ea] cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <span className="flex-1">{section}</span>
        {expandedSections[section] ? <MdExpandLess className="text-2xl" /> : <MdExpandMore className="text-2xl" />}
      </div>
      {expandedSections[section] && (
        <ul className="ml-6 space-y-2 mt-2">
          {items.map((item, subIndex) => renderMenuItem(item, subIndex))}
        </ul>
      )}
    </li>
  );

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
        <div className="py-6 px-6">
          <ul className="space-y-2">
            {getMenuItems().map((item, index) => 
              item.section 
                ? renderSection(item.section, item.items, index)
                : renderMenuItem(item, index)
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;