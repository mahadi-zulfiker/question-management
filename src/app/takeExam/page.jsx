"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExamList() {
    const router = useRouter();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [classFilter, setClassFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

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
                    const uniqueSubjects = [...new Set(data.classes.map(c => c.subject))];
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

    // Function to determine exam type based on questions
    const getExamType = (questions) => {
        if (!questions || !Array.isArray(questions) || questions.length === 0) return "Unknown";
        const types = [...new Set(questions.map(q => q.type || "unknown"))].filter(t => t !== "unknown");
        if (types.length === 0) return "Unknown";
        if (types.length === 1) return types[0];
        return `Mixed (${types.join(", ")})`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-blue-100">
                    <h2 className="text-5xl font-extrabold mb-12 text-center text-indigo-900 tracking-wide drop-shadow-md">
                        📋 Exam Directory
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <select
                            className="w-full p-5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800 font-semibold bg-white/80 hover:bg-white shadow-md"
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
                            className="w-full p-5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800 font-semibold bg-white/80 hover:bg-white shadow-md disabled:bg-gray-200 disabled:text-gray-500"
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
                    {loading ? (
                        <p className="text-center text-blue-700 text-2xl py-8 animate-pulse">🔄 Loading exams...</p>
                    ) : exams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {exams.map((exam) => (
                                <div
                                    key={exam._id}
                                    className="border border-blue-100 p-6 rounded-2xl bg-white hover:bg-blue-50/50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-2 duration-300"
                                >
                                    <p className="text-2xl font-bold text-gray-900 mb-3">{exam.title}</p>
                                    <p className="text-blue-700 mb-2">🕒 Duration: {exam.duration} mins</p>
                                    <p className="text-gray-600 mb-2">📚 Class: {exam.classNumber}</p>
                                    <p className="text-gray-600 mb-2">📖 Subject: {exam.subject}</p>
                                    <p className="text-gray-600 mb-4">📝 Type: {exam.type}</p>
                                    <button
                                        onClick={() => router.push(`/takeExam/${exam._id}`)}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-semibold shadow-md"
                                    >
                                        🏁 Start Exam
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-red-600 font-bold text-2xl py-8">❌ No exams available.</p>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Footer />
        </div>
    );
}