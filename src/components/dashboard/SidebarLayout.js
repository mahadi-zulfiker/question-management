"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MdAdminPanelSettings,
  MdExpandMore,
  MdExpandLess,
  MdOutlineDashboard,
} from "react-icons/md";
import {
  BiHomeSmile,
  BiMoney,
  BiBook,
  BiUser,
  BiHistory,
} from "react-icons/bi";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaPlus,
  FaRegIdBadge,
  FaUsers,
  FaMoneyCheckAlt,
  FaQuestion,
} from "react-icons/fa";
import {
  HiOutlineReceiptRefund,
  HiOutlineDocumentReport,
} from "react-icons/hi";
import { GiNotebook, GiGraduateCap } from "react-icons/gi";
import {
  TbCertificate,
  TbListDetails,
  TbPackage,
} from "react-icons/tb";
import {
  AiOutlineFileAdd,
  AiOutlineProfile,
  AiOutlineEye,
  AiOutlineDollar,
} from "react-icons/ai";
import {
  RiTeamLine,
  RiQuestionnaireLine,
  RiBookReadLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { IoMdCreate, IoMdSettings, IoMdEye } from "react-icons/io";
import { BsQuestionSquare, BsCardChecklist } from "react-icons/bs";
import { VscPackage, VscGraph } from "react-icons/vsc";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState({});

  const isActive = (route) =>
    pathname === route
      ? "bg-blue-100 text-blue-800"
      : "text-gray-800 hover:bg-blue-50 hover:text-blue-700";

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const commonMenuItems = [
    {
      href: "/",
      icon: <BiHomeSmile className="text-xl mr-2" />,
      label: "Back to Home",
    },
  ];

  const getMenuItems = () => {
    if (pathname.startsWith("/dashboard/student")) {
      return [
        ...commonMenuItems,
        {
          section: "My Profile",
          items: [
            { href: "/dashboard/student/studentProfile", icon: <FaUserGraduate className="text-xl mr-2" />, label: "My Profile" },
            { href: "/dashboard/student/studentRequest", icon: <BsQuestionSquare className="text-xl mr-2" />, label: "My Requests" },
            { href: "/dashboard/student/studentGurdian", icon: <BiUser className="text-xl mr-2" />, label: "My Guardian" },
          ],
        },
        {
          section: "Exams",
          items: [
            { href: "/dashboard/student/viewExams", icon: <TbListDetails className="text-xl mr-2" />, label: "View Exams" },
            { href: "/dashboard/student/attendedExams", icon: <RiBookReadLine className="text-xl mr-2" />, label: "Attended Exams" },
            { href: "/dashboard/student/seeQuestions", icon: <RiBookReadLine className="text-xl mr-2" />, label: "See Questions" },
          ],
        },
        {
          section: "Achievements",
          items: [
            { href: "/dashboard/student/certificates", icon: <TbCertificate className="text-xl mr-2" />, label: "Certificates" },
            { href: "/dashboard/student/marksHistory", icon: <VscGraph className="text-xl mr-2" />, label: "Marks History" },
          ],
        },
        {
          section: "Payments",
          items: [
            { href: "/dashboard/student/paymentHistoryStudent", icon: <BiMoney className="text-xl mr-2" />, label: "Payment History" },
          ],
        },
      ];
    } else if (pathname.startsWith("/dashboard/teacher")) {
      return [
        ...commonMenuItems,
        {
          section: "My Profile",
          items: [
            { href: "/dashboard/teacher/teacherProfile", icon: <FaChalkboardTeacher className="text-xl mr-2" />, label: "My Profile" },
          ],
        },
        {
          section: "Content Creation",
          items: [
            { href: "/dashboard/teacher/createMCQTeacher", icon: <IoMdCreate className="text-xl mr-2" />, label: "Create MCQ" },
            { href: "/dashboard/teacher/createCQTeacher", icon: <FaPlus className="text-xl mr-2" />, label: "Create CQ" },
            { href: "/dashboard/teacher/createSQTeacher", icon: <AiOutlineFileAdd className="text-xl mr-2" />, label: "Create SQ" },
            { href: "/dashboard/teacher/createCertificate", icon: <TbCertificate className="text-xl mr-2" />, label: "Create Certificate" },
          ],
        },
        {
          section: "Classes",
          items: [
            { href: "/dashboard/teacher/createStudentCircle", icon: <RiTeamLine className="text-xl mr-2" />, label: "Create Student Circle" },
            { href: "/dashboard/teacher/viewCircle", icon: <AiOutlineProfile className="text-xl mr-2" />, label: "View Circles" },
            { href: "/dashboard/teacher/teacherRequests", icon: <FaQuestion className="text-xl mr-2" />, label: "Teacher Requests" },
            { href: "/dashboard/teacher/examResult", icon: <BsCardChecklist className="text-xl mr-2" />, label: "Exam Results" },
          ],
        },
        {
          section: "Resources",
          items: [
            { href: "/dashboard/teacher/viewQuestions", icon: <RiQuestionnaireLine className="text-xl mr-2" />, label: "View Questions" },
            { href: "/dashboard/teacher/viewCertificate", icon: <IoMdEye className="text-xl mr-2" />, label: "View Certificates" },
          ],
        },
        {
          section: "Payments",
          items: [
            { href: "/dashboard/teacher/affiliateTeacher", icon: <HiOutlineReceiptRefund className="text-xl mr-2" />, label: "Discount Generator" },
            { href: "/dashboard/teacher/paymentHistory", icon: <BiHistory className="text-xl mr-2" />, label: "Payment History" },
            { href: "/dashboard/teacher/affiliateShareTeacher", icon: <FaMoneyCheckAlt className="text-xl mr-2" />, label: "Affiliate Program" },
          ],
        },
      ];
    } else if (pathname.startsWith("/dashboard/admin")) {
      return [
        ...commonMenuItems,
        {
          section: "Management",
          items: [
            { href: "/dashboard/admin/adminProfileManagement", icon: <MdAdminPanelSettings className="text-xl mr-2" />, label: "Profile Management" },
            { href: "/dashboard/admin/userManagement", icon: <FaUsers className="text-xl mr-2" />, label: "User Management" },
            { href: "/dashboard/admin/userAccessControl", icon: <IoMdSettings className="text-xl mr-2" />, label: "User Access Control" },
          ],
        },
        {
          section: "Question Creation",
          items: [
            { href: "/dashboard/admin/createMCQAdmin", icon: <IoMdCreate className="text-xl mr-2" />, label: "Create MCQ" },
            { href: "/dashboard/admin/createCQAdmin", icon: <FaPlus className="text-xl mr-2" />, label: "Create CQ" },
            { href: "/dashboard/admin/createSQAdmin", icon: <AiOutlineFileAdd className="text-xl mr-2" />, label: "Create SQ" },
            { href: "/dashboard/admin/createPackage", icon: <TbPackage className="text-xl mr-2" />, label: "Create Package" },
            { href: "/dashboard/admin/createClass", icon: <RiTeamLine className="text-xl mr-2" />, label: "Create Class" },
            { href: "/dashboard/admin/createCertificateAdmin", icon: <TbCertificate className="text-xl mr-2" />, label: "Create Certificate" },
            { href: "/dashboard/admin/createModelTest", icon: <BiBook className="text-xl mr-2" />, label: "Create Model Test" },
            { href: "/dashboard/admin/createAdmissionTest", icon: <FaRegIdBadge className="text-xl mr-2" />, label: "Create Admission Test" },
            { href: "/dashboard/admin/createQuestionBank", icon: <GiNotebook className="text-xl mr-2" />, label: "Create Question Bank" },
            { href: "/dashboard/admin/onlineExamAdmin", icon: <BiBook className="text-xl mr-2" />, label: "Model Test" },
          ],
        },
        {
          section: "Resources",
          items: [
            { href: "/dashboard/admin/viewQuestionsAdmin", icon: <RiQuestionnaireLine className="text-xl mr-2" />, label: "View Questions" },
            { href: "/dashboard/admin/teacherQuestions", icon: <AiOutlineEye className="text-xl mr-2" />, label: "Teacher Questions" },
            { href: "/dashboard/admin/viewCertificateAdmin", icon: <GiGraduateCap className="text-xl mr-2" />, label: "View Certificates" },
            { href: "/dashboard/admin/viewModelTest", icon: <VscGraph className="text-xl mr-2" />, label: "View Model Tests" },
            { href: "/dashboard/admin/viewAdmissionTest", icon: <BsCardChecklist className="text-xl mr-2" />, label: "View Admission Tests" },
            { href: "/dashboard/admin/viewQuestionBank", icon: <HiOutlineDocumentReport className="text-xl mr-2" />, label: "View Question Banks" },
          ],
        },
        {
          section: "Payments",
          items: [
            { href: "/dashboard/admin/affiliateAdmin", icon: <HiOutlineReceiptRefund className="text-xl mr-2" />, label: "Discount Generator" },
            { href: "/dashboard/admin/priceSetQuestions", icon: <AiOutlineDollar className="text-xl mr-2" />, label: "Set Pricing" },
            { href: "/dashboard/admin/paymentHistoryAll", icon: <BiHistory className="text-xl mr-2" />, label: "Payment History" },
            { href: "/dashboard/admin/affiliateShareView", icon: <RiMoneyDollarCircleLine className="text-xl mr-2" />, label: "View Affiliate" },
          ],
        },
      ];
    }
    return commonMenuItems;
  };

  const renderMenuItem = (item, index) => (
    <li key={index}>
      <Link
        href={item.href}
        className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-500 ${isActive(
          item.href
        )} group`}
        onClick={() => isSidebarOpen && toggleSidebar()} // Close sidebar on mobile after clicking
      >
        <span className="text-lg group-hover:scale-110 transition-transform duration-500">
          {item.icon}
        </span>
        <span className="ml-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
          {item.label}
        </span>
      </Link>
    </li>
  );

  const renderSection = (section, items, index) => (
    <li key={index}>
      <div
        className="flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-500 text-gray-800 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <span className="flex-1 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {section}
        </span>
        {expandedSections[section] ? (
          <MdExpandLess className="text-lg" />
        ) : (
          <MdExpandMore className="text-lg" />
        )}
      </div>
      {expandedSections[section] && (
        <ul className="ml-5 space-y-1 mt-1">
          {items.map((item, subIndex) => renderMenuItem(item, subIndex))}
        </ul>
      )}
    </li>
  );

  return (
    <nav
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] transition-all duration-700 ease-in-out z-40 ${
        isSidebarOpen ? "w-60" : "w-0 lg:w-60"
      } lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} bg-white/90 backdrop-blur-md shadow-xl border-r border-gray-100/50 overflow-y-auto`}
    >
      <div className="py-6 px-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <MdOutlineDashboard className="text-2xl text-indigo-600" />
          <span className="text-xl font-bold text-indigo-900">Menu</span>
        </div>
        <ul className="space-y-1">
          {getMenuItems().map((item, index) =>
            item.section ? renderSection(item.section, item.items, index) : renderMenuItem(item, index)
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;