'use client';
import { MdAdminPanelSettings } from "react-icons/md";
import { BiHomeSmile, BiBookBookmark } from "react-icons/bi";
import { FaUserGraduate, FaChalkboardTeacher, FaPlus, FaRegIdBadge } from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { GiNotebook } from "react-icons/gi";
import { TbCertificate, TbListDetails } from "react-icons/tb";
import { AiOutlineFileAdd, AiOutlineProfile } from "react-icons/ai";
import { RiTeamLine, RiQuestionnaireLine, RiBookReadLine } from "react-icons/ri";
import { IoMdCreate } from "react-icons/io";
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
      icon: <BiHomeSmile className="text-2xl mr-2" />, 
      label: "Back to Home",
    },
  ];

  const getMenuItems = () => {
    if (pathname.startsWith("/dashboard/student")) {
      return [
        ...commonMenuItems,
        { href: "/dashboard/student/studentProfile", icon: <FaUserGraduate className="text-2xl mr-2" />, label: "Student Profile" },
        { href: "/dashboard/student/viewExams", icon: <TbListDetails className="text-2xl mr-2" />, label: "View Exams" },
        { href: "/dashboard/student/certificates", icon: <TbCertificate className="text-2xl mr-2" />, label: "Certificates" },
        { href: "/dashboard/student/marksHistory", icon: <GiNotebook className="text-2xl mr-2" />, label: "Marks History" },
        { href: "/dashboard/student/attendedExams", icon: <RiBookReadLine className="text-2xl mr-2" />, label: "Attended Exams" },
        { href: "/dashboard/student/paymentHistoryStudent", icon: <HiOutlineReceiptRefund className="text-2xl mr-2" />, label: "Payment History" },
      ];
    } else if (pathname.startsWith("/dashboard/teacher")) {
      return [
        ...commonMenuItems,
        { href: "/dashboard/teacher/teacherProfile", icon: <FaChalkboardTeacher className="text-2xl mr-2" />, label: "Teacher Profile" },
        { href: "/dashboard/teacher/createMCQTeacher", icon: <IoMdCreate className="text-2xl mr-2" />, label: "Create MCQ" },
        { href: "/dashboard/teacher/createCQTeacher", icon: <FaPlus className="text-2xl mr-2" />, label: "Create CQ" },
        { href: "/dashboard/teacher/createSQTeacher", icon: <AiOutlineFileAdd className="text-2xl mr-2" />, label: "Create SQ" },
        { href: "/dashboard/teacher/createCertificate", icon: <TbCertificate className="text-2xl mr-2" />, label: "Create Certificate" },
        { href: "/dashboard/teacher/createStudentCircle", icon: <RiTeamLine className="text-2xl mr-2" />, label: "Create Student Circle" },
        { href: "/dashboard/teacher/viewCertificate", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "View Certificate" },
        { href: "/dashboard/teacher/viewCircle", icon: <AiOutlineProfile className="text-2xl mr-2" />, label: "View Circle" },
        { href: "/dashboard/teacher/viewQuestions", icon: <RiQuestionnaireLine className="text-2xl mr-2" />, label: "View Questions" },
        { href: "/dashboard/teacher/affiliateTeacher", icon: <RiQuestionnaireLine className="text-2xl mr-2" />, label: "Affiliate teacher" },
        { href: "/dashboard/teacher/paymentHistory", icon: <HiOutlineReceiptRefund className="text-2xl mr-2" />, label: "Payment History" },
      ];
    } else if (pathname.startsWith("/dashboard/admin")) {
      return [
        ...commonMenuItems,
        { href: "/dashboard/admin/adminProfileManagement", icon: <MdAdminPanelSettings className="text-2xl mr-2" />, label: "Profile Management" },
        { href: "/dashboard/admin/userManagement", icon: <MdAdminPanelSettings className="text-2xl mr-2" />, label: "User Management" },
        { href: "/dashboard/admin/createMCQAdmin", icon: <IoMdCreate className="text-2xl mr-2" />, label: "Create MCQ" },
        { href: "/dashboard/admin/createCQAdmin", icon: <FaPlus className="text-2xl mr-2" />, label: "Create CQ" },
        { href: "/dashboard/admin/createSQAdmin", icon: <AiOutlineFileAdd className="text-2xl mr-2" />, label: "Create SQ" },
        { href: "/dashboard/admin/createPackage", icon: <TbListDetails className="text-2xl mr-2" />, label: "Create Package" },
        { href: "/dashboard/admin/createClass", icon: <RiTeamLine className="text-2xl mr-2" />, label: "Create Class" },
        { href: "/dashboard/admin/viewQuestionsAdmin", icon: <RiQuestionnaireLine className="text-2xl mr-2" />, label: "View Questions" },
        { href: "/dashboard/admin/teacherQuestions", icon: <BiBookBookmark className="text-2xl mr-2" />, label: "Teacher Questions" },
        { href: "/dashboard/admin/createCertificateAdmin", icon: <TbCertificate className="text-2xl mr-2" />, label: "Create Certificate" },
        { href: "/dashboard/admin/viewCertificateAdmin", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "View Certificate" },
        { href: "/dashboard/admin/createModelTest", icon: <BiBookBookmark className="text-2xl mr-2" />, label: "Create Model Test" },
        { href: "/dashboard/admin/viewModelTest", icon: <BiBookBookmark className="text-2xl mr-2" />, label: "View Model Test" },
        { href: "/dashboard/admin/createAdmissionTest", icon: <TbCertificate className="text-2xl mr-2" />, label: "Create Admission Test" },
        { href: "/dashboard/admin/viewAdmissionTest", icon: <TbCertificate className="text-2xl mr-2" />, label: "View Admission Test" },
        { href: "/dashboard/admin/createQuestionBank", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "Create Question Bank" },
        { href: "/dashboard/admin/viewQuestionBank", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "View Question Bank" },
        { href: "/dashboard/admin/affiliateAdmin", icon: <FaRegIdBadge className="text-2xl mr-2" />, label: "Affiliate" },
        { href: "/dashboard/admin/paymentHistoryAll", icon: <HiOutlineReceiptRefund className="text-2xl mr-2" />, label: "Payment History" },
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
        <div className="py-6 px-6">
          <ul className="space-y-2">
            {getMenuItems().map((item, index) => (
              <li key={index}>
                <Link href={item.href} className={`menu-item flex items-center rounded-md px-3 py-3 transition-all duration-300 ${isActive(item.href)}`}>{item.icon}<span>{item.label}</span></Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;