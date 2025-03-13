"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ViewExams() {
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/exam/classes");
        const data = await response.json();
        if (response.ok) {
          setClasses(data.classes || []);
        } else {
          toast.error("❌ Failed to load classes!");
        }
      } catch (error) {
        toast.error(`❌ Error fetching classes: ${error.message}`);
      }
    };
    fetchClasses();
  }, []);

  // Fetch subjects based on selected class
  useEffect(() => {
    if (!classFilter) {
      setSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/exam/classes?classNumber=${classFilter}`);
        const data = await response.json();
        if (response.ok) {
          const uniqueSubjects = [...new Set(data.classes.map((c) => c.subject))];
          setSubjects(uniqueSubjects);
        } else {
          toast.error("❌ Failed to load subjects!");
        }
      } catch (error) {
        toast.error(`❌ Error fetching subjects: ${error.message}`);
      }
    };
    fetchSubjects();
  }, [classFilter]);

  // Fetch exams based on filters
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const url = new URL("/api/takeExam", window.location.origin);
        if (classFilter) url.searchParams.append("classNumber", classFilter);
        if (subjectFilter) url.searchParams.append("subject", subjectFilter);

        const response = await fetch(url.toString());
        const data = await response.json();
        if (response.ok && data.exams) {
          setExams(data.exams);
        } else {
          throw new Error(data.message || "Exam fetch failed");
        }
      } catch (error) {
        toast.error(`❌ Error fetching exams: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [classFilter, subjectFilter]);

  // Determine exam type based on questions
  const getExamType = (questions) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return "Unknown";
    const types = [...new Set(questions.map((q) => q.type || "unknown"))].filter((t) => t !== "unknown");
    if (types.length === 0) return "Unknown";
    if (types.length === 1) return types[0];
    return `Mixed (${types.join(", ")})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-indigo-900 mb-2">
            📚 Your Exam Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Explore and start your exams with ease. Filter by class and subject to find what you need!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <select
              className="w-full sm:w-1/2 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-gray-700 bg-white shadow-sm hover:shadow-md transition-all"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.classNumber}>
                  Class {cls.classNumber} ({cls.level})
                </option>
              ))}
            </select>
            <select
              className="w-full sm:w-1/2 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-gray-700 bg-white shadow-sm hover:shadow-md transition-all disabled:bg-gray-100 disabled:text-gray-400"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              disabled={!classFilter}
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Exam List */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-indigo-600 text-xl animate-pulse">🔄 Loading your exams...</p>
            </div>
          ) : exams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-white border border-gray-100 rounded-lg p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{exam.title}</h3>
                  <p className="text-gray-600 mb-1">🕒 {exam.duration} mins</p>
                  <p className="text-gray-600 mb-1">📚 Class: {exam.classNumber}</p>
                  <p className="text-gray-600 mb-1">📖 Subject: {exam.subject}</p>
                  <p className="text-gray-600 mb-4">📝 Type: {exam.type || getExamType(exam.questions)}</p>
                  <button
                    onClick={() => router.push(`/takeExam/${exam._id}`)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-medium"
                  >
                    🏁 Start Exam
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-red-500 font-semibold text-xl">❌ No exams available yet.</p>
              <p className="text-gray-500">Try adjusting your filters or check back later!</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}