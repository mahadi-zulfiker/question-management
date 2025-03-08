"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateExam() {
    const [examTitle, setExamTitle] = useState("");
    const [examType, setExamType] = useState("");
    const [duration, setDuration] = useState("");
    const [classNumber, setClassNumber] = useState("");
    const [subject, setSubject] = useState("");
    const [chapterNumber, setChapterNumber] = useState("");
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch available classes on mount
    useEffect(() => {
        async function fetchClasses() {
            try {
                const response = await fetch("/api/exam/classes");
                const data = await response.json();
                if (response.ok) {
                    setClasses(data.classes || []);
                } else {
                    toast.error("❌ Failed to load classes!");
                }
            } catch (error) {
                toast.error("❌ Error fetching classes!");
            }
        }
        fetchClasses();
    }, []);

    // Fetch subjects when classNumber changes
    useEffect(() => {
        if (!classNumber) {
            setSubjects([]);
            setChapters([]);
            setQuestions([]);
            return;
        }
        async function fetchSubjects() {
            try {
                const response = await fetch(`/api/exam/classes?classNumber=${classNumber}`);
                const data = await response.json();
                if (response.ok) {
                    const uniqueSubjects = [...new Set(data.classes.map(c => c.subject))];
                    setSubjects(uniqueSubjects);
                } else {
                    toast.error("❌ Failed to load subjects!");
                }
            } catch (error) {
                toast.error("❌ Error fetching subjects!");
            }
        }
        fetchSubjects();
    }, [classNumber]);

    // Fetch chapters when subject changes
    useEffect(() => {
        if (!classNumber || !subject) {
            setChapters([]);
            setQuestions([]);
            return;
        }
        async function fetchChapters() {
            try {
                const response = await fetch(`/api/exam/classes?classNumber=${classNumber}&subject=${subject}`);
                const data = await response.json();
                if (response.ok) {
                    const uniqueChapters = [...new Set(data.classes.map(c => c.chapterNumber))];
                    setChapters(uniqueChapters);
                } else {
                    toast.error("❌ Failed to load chapters!");
                }
            } catch (error) {
                toast.error("❌ Error fetching chapters!");
            }
        }
        fetchChapters();
    }, [classNumber, subject]);

    // Fetch questions when all filters are set
    useEffect(() => {
        if (!examType || !classNumber || !subject || !chapterNumber) {
            setQuestions([]);
            setFilteredQuestions([]);
            setSelectedQuestions([]);
            return;
        }

        async function fetchQuestions() {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/exam/questions?type=${examType}&classNumber=${classNumber}&subject=${subject}&chapterNumber=${chapterNumber}`
                );
                const data = await response.json();
                if (response.ok) {
                    const fetchedQuestions = Array.isArray(data.questions) ? data.questions : [];
                    setQuestions(fetchedQuestions);
                    setFilteredQuestions(fetchedQuestions);
                } else {
                    toast.error("❌ প্রশ্ন লোড করতে সমস্যা হয়েছে!");
                }
            } catch (error) {
                toast.error("❌ Fetch error!");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [examType, classNumber, subject, chapterNumber]);

    // Filter questions based on search query
    useEffect(() => {
        const filtered = questions.filter(q => {
            if (examType === "MCQ") return q.question.toLowerCase().includes(searchQuery.toLowerCase());
            if (examType === "CQ") return q.passage.toLowerCase().includes(searchQuery.toLowerCase());
            if (examType === "SQ") return q.question.toLowerCase().includes(searchQuery.toLowerCase());
            return false;
        });
        setFilteredQuestions(filtered);
    }, [searchQuery, questions, examType]);

    const handleSelect = (question) => {
        setSelectedQuestions((prev) =>
            prev.some(q => q._id === question._id)
                ? prev.filter(q => q._id !== question._id)
                : [...prev, question]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!examTitle.trim()) return toast.error("❌ Exam title cannot be empty!");
        if (!examType) return toast.error("❌ Please select an exam type!");
        if (!duration || duration <= 0) return toast.error("❌ Duration must be a positive number!");
        if (!classNumber) return toast.error("❌ Please select a class!");
        if (!subject) return toast.error("❌ Please select a subject!");
        if (!chapterNumber) return toast.error("❌ Please select a chapter!");
        if (selectedQuestions.length === 0) return toast.error("❌ Select at least one question!");

        const examData = {
            title: examTitle,
            type: examType,
            duration: parseInt(duration),
            classNumber,
            subject,
            chapterNumber,
            questions: selectedQuestions,
        };

        try {
            const response = await fetch("/api/exam", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(examData),
            });

            if (response.ok) {
                toast.success("✅ পরীক্ষা সফলভাবে তৈরি হয়েছে!");
                resetForm();
            } else {
                toast.error("❌ কিছু সমস্যা হয়েছে!");
            }
        } catch (error) {
            toast.error("❌ Submission error!");
        }
    };

    const resetForm = () => {
        setExamTitle("");
        setExamType("");
        setDuration("");
        setClassNumber("");
        setSubject("");
        setChapterNumber("");
        setQuestions([]);
        setFilteredQuestions([]);
        setSelectedQuestions([]);
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
            <Navbar />
            <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-800 tracking-tight">
                        📚 Create a New Exam
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Exam Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter exam title"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                                <input
                                    type="number"
                                    placeholder="Enter duration"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={classNumber}
                                    onChange={(e) => setClassNumber(e.target.value)}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((cls) => (
                                        <option key={cls._id} value={cls.classNumber}>
                                            Class {cls.classNumber} ({cls.level})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    disabled={!classNumber}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((sub) => (
                                        <option key={sub} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                                    value={chapterNumber}
                                    onChange={(e) => setChapterNumber(e.target.value)}
                                    required
                                    disabled={!subject}
                                >
                                    <option value="">Select Chapter</option>
                                    {chapters.map((chap) => (
                                        <option key={chap} value={chap}>
                                            Chapter {chap}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Exam Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                required
                            >
                                <option value="">Select Exam Type</option>
                                <option value="MCQ">Multiple Choice (MCQ)</option>
                                <option value="CQ">Creative Questions (CQ)</option>
                                <option value="SQ">Short Questions (SQ)</option>
                            </select>
                        </div>

                        {/* Questions Section */}
                        {examType && classNumber && subject && chapterNumber && (
                            <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-semibold text-gray-800">📝 Select Questions</h3>
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        className="w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {loading ? (
                                    <p className="text-gray-500 text-center py-4">🔄 Loading questions...</p>
                                ) : filteredQuestions.length > 0 ? (
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q._id}
                                                className="border border-gray-200 p-4 rounded-lg bg-white hover:bg-blue-50 transition shadow-sm"
                                            >
                                                <label className="flex items-start space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleSelect(q)}
                                                        checked={selectedQuestions.some(sel => sel._id === q._id)}
                                                        className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <div>
                                                        {examType === "MCQ" && (
                                                            <>
                                                                <p className="font-semibold text-gray-800">{q.question}</p>
                                                                <ul className="list-disc ml-6 text-sm text-gray-600">
                                                                    {q.options?.map((opt, idx) => (
                                                                        <li key={idx}>{opt}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                        {examType === "CQ" && (
                                                            <>
                                                                <p className="font-semibold text-gray-800">{q.passage}</p>
                                                                <ul className="list-disc ml-6 text-sm text-gray-600">
                                                                    {q.questions?.map((cq, idx) => (
                                                                        <li key={idx}>{cq}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                        {examType === "SQ" && (
                                                            <p className="font-semibold text-gray-800">{q.question}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-center py-4">❌ No questions found for this filter.</p>
                                )}
                            </div>
                        )}

                        {/* Preview Section */}
                        {selectedQuestions.length > 0 && (
                            <div className="mt-8 bg-green-50 p-6 rounded-xl">
                                <h3 className="text-2xl font-semibold text-gray-800 mb-4">👀 Selected Questions Preview</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {selectedQuestions.map((q) => (
                                        <div
                                            key={q._id}
                                            className="border border-green-200 p-4 rounded-lg bg-white shadow-sm"
                                        >
                                            {examType === "MCQ" && <p className="font-semibold">{q.question}</p>}
                                            {examType === "CQ" && <p className="font-semibold">{q.passage}</p>}
                                            {examType === "SQ" && <p className="font-semibold">{q.question}</p>}
                                            <button
                                                onClick={() => handleSelect(q)}
                                                className="text-red-500 text-sm mt-2 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 mt-8 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            ✅ Create Exam
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Footer />
        </div>
    );
}