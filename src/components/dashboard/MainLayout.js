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
import CreateCertificate from "./Teacher/CreateCertificate";
import CreateStudentCircle from "./Teacher/CreateStudentCircle";
import ViewCertificate from "./Teacher/ViewCertificate";
import ViewCircle from "./Teacher/ViewCircle";
import ViewQuestions from "./Teacher/ViewQuestions";
import PaymentHistory from "./Teacher/PaymentHistory";
import ViewExams from "./Student/ViewExams";
import Certificates from "./Student/Certificates";
import MarksHistory from "./Student/MarksHistory";
import AttendedExams from "./Student/AttendedExams";
import PaymentHistoryStudent from "./Student/PaymentHistoryStudent";
import StudentProfile from "./Student/StudentProfile";
import TeacherProfile from "./Teacher/TeacherProfile";
import CreateClass from "./Admin/CreateClass";
import PaymentHistoryAll from "./Admin/PaymentHistoryAll";
import ViewQuestionsAdmin from "./Admin/ViewQuestionsAdmin";
import TeacherQuestions from "./Admin/TeacherQuestions";
import CreateCertificateAdmin from "./Admin/CreateCertificateAdmin";
import ViewCertificateAdmin from "./Admin/ViewCertificateAdmin/page";
import CreateModelTest from "./Admin/CreateModelTest";
import CreateAdmissonTest from "./Admin/CreateAdmissonTest";
import CreateQuestionBank from "./Admin/CreateQuestionBank";
import ViewModelTest from "./Admin/ViewModelTest";
import ViewAdmissionTest from "./Admin/ViewAdmissionTest";
import ViewQuestionBank from "./Admin/ViewQuestionBank";
import UserManagment from "./Admin/UserManagement";
import AffiliateAdmin from "./Admin/AffiliateAdmin";
import AffiliateTeacher from "./Teacher/AffiliateTeacher";


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

            {pathname === "/dashboard/student" && <Student />}
            {pathname === "/dashboard/student/studentProfile" && <StudentProfile />}
            {pathname === "/dashboard/student/viewExams" && <ViewExams />}
            {pathname === "/dashboard/student/certificates" && <Certificates />}
            {pathname === "/dashboard/student/marksHistory" && <MarksHistory />}
            {pathname === "/dashboard/student/attendedExams" && <AttendedExams />}
            {pathname === "/dashboard/student/paymentHistoryStudent" && <PaymentHistoryStudent />}

            {pathname === "/dashboard/teacher" && <Teacher />}
            {pathname === "/dashboard/teacher/teacherProfile" && <TeacherProfile />}
            {pathname === "/dashboard/teacher/createMCQTeacher" && <CreateMCQTeacher />}
            {pathname === "/dashboard/teacher/createCQTeacher" && <CreateCQTeacher />}
            {pathname === "/dashboard/teacher/createSQTeacher" && <CreateSQTeacher />}
            {pathname === "/dashboard/teacher/createCertificate" && <CreateCertificate />}
            {pathname === "/dashboard/teacher/createStudentCircle" && <CreateStudentCircle />}
            {pathname === "/dashboard/teacher/viewCertificate" && <ViewCertificate />}
            {pathname === "/dashboard/teacher/viewCircle" && <ViewCircle />}
            {pathname === "/dashboard/teacher/viewQuestions" && <ViewQuestions />}
            {pathname === "/dashboard/teacher/paymentHistory" && <PaymentHistory />}
            {pathname === "/dashboard/teacher/affiliateTeacher" && <AffiliateTeacher />}

            {pathname === "/dashboard/admin" && <Admin />}
            {pathname === "/dashboard/admin/adminProfileManagement" && <AdminProfileManagement />}
            {pathname === "/dashboard/admin/createMCQAdmin" && <CreateMCQAdmin />}
            {pathname === "/dashboard/admin/createCQAdmin" && <CreateCQAdmin />}
            {pathname === "/dashboard/admin/createSQAdmin" && <CreateSQAdmin />}
            {pathname === "/dashboard/admin/createPackage" && <CreatePackage />}
            {pathname === "/dashboard/admin/createClass" && <CreateClass />}
            {pathname === "/dashboard/admin/paymentHistoryAll" && <PaymentHistoryAll />}
            {pathname === "/dashboard/admin/viewQuestionsAdmin" && <ViewQuestionsAdmin />}
            {pathname === "/dashboard/admin/teacherQuestions" && <TeacherQuestions />}
            {pathname === "/dashboard/admin/createCertificateAdmin" && <CreateCertificateAdmin />}
            {pathname === "/dashboard/admin/viewCertificateAdmin" && <ViewCertificateAdmin />}
            {pathname === "/dashboard/admin/createModelTest" && <CreateModelTest />}
            {pathname === "/dashboard/admin/createAdmissionTest" && <CreateAdmissonTest />}
            {pathname === "/dashboard/admin/createQuestionBank" && <CreateQuestionBank />}
            {pathname === "/dashboard/admin/viewModelTest" && <ViewModelTest />}
            {pathname === "/dashboard/admin/viewAdmissionTest" && <ViewAdmissionTest />}
            {pathname === "/dashboard/admin/viewQuestionBank" && <ViewQuestionBank />}
            {pathname === "/dashboard/admin/userManagement" && <UserManagment />}
            {pathname === "/dashboard/admin/affiliateAdmin" && <AffiliateAdmin />}

          </div>

        </section>
      </div>
    </div>
  );
};

export default MainLayout;
