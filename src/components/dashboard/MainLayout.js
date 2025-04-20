"use client";
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
import PriceSetQuestion from "./Admin/PriceSetQuestions";
import StudentRequest from "./Student/StudentRequest";
import StudentGurdian from "./Student/StudentGurdian";
import ExamResult from "./Teacher/ExamResult";
import TeacherRequests from "./Teacher/TeacherRequests";
import UserAccessControl from "./Admin/UserAccessControl";
import AffiliateShareView from "./Admin/AffiliateShareView";
import AffiliateShareTeacher from "./Teacher/AffiliateShareTeacher";
import OnlineExamAdmin from "./Admin/OnlineExamAdmin";
import SeeQuestions from "./Student/SeeQuestions";
import ActivityChecker from "./Admin/ActivityChecker";
import CreateMorderator from "./Admin/CreateMorderator";
import Moderator from "./Moderator";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const pathname = usePathname();

  return (
    <div className="relative bg-[#f7f6f9] min-h-screen font-[sans-serif]">
      <Header toggleSidebar={toggleSidebar} />
      <div className="flex items-start">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-700 ease-in-out pt-16 ${
            isSidebarOpen ? "lg:ml-60 ml-0" : "lg:ml-60 ml-0"
          }`}
        >
          <div className="p-6 lg:p-8">
            {/* Content based on route */}
            {pathname === "/dashboard/student" && <Student />}
            {pathname === "/dashboard/student/studentProfile" && <StudentProfile />}
            {pathname === "/dashboard/student/viewExams" && <ViewExams />}
            {pathname === "/dashboard/student/certificates" && <Certificates />}
            {pathname === "/dashboard/student/marksHistory" && <MarksHistory />}
            {pathname === "/dashboard/student/attendedExams" && <AttendedExams />}
            {pathname === "/dashboard/student/paymentHistoryStudent" && <PaymentHistoryStudent />}
            {pathname === "/dashboard/student/studentRequest" && <StudentRequest />}
            {pathname === "/dashboard/student/studentGurdian" && <StudentGurdian />}
            {pathname === "/dashboard/student/seeQuestions" && <SeeQuestions />}

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
            {pathname === "/dashboard/teacher/examResult" && <ExamResult />}
            {pathname === "/dashboard/teacher/teacherRequests" && <TeacherRequests />}
            {pathname === "/dashboard/teacher/affiliateShareTeacher" && <AffiliateShareTeacher />}

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
            {pathname === "/dashboard/admin/priceSetQuestions" && <PriceSetQuestion />}
            {pathname === "/dashboard/admin/userAccessControl" && <UserAccessControl />}
            {pathname === "/dashboard/admin/affiliateShareView" && <AffiliateShareView />}
            {pathname === "/dashboard/admin/onlineExamAdmin" && <OnlineExamAdmin />}
            {pathname === "/dashboard/admin/activityChecker" && <ActivityChecker />}
            {pathname === "/dashboard/admin/createMorderator" && <CreateMorderator />}

            {pathname === "/dashboard/moderator" && <Moderator />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;