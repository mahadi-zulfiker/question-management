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

    useEffect(() => {
        async function fetchClasses() {
            try {
                const response = await fetch("/api/exam/classes");
                const data = await response.json();
                if (response.ok) setClasses(data.classes || []);
                else toast.error("❌ Failed to load classes!");
            } catch (error) {
                toast.error("❌ Error fetching classes!");
            }
        }
        fetchClasses();
    }, []);

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
                } else toast.error("❌ Failed to load subjects!");
            } catch (error) {
                toast.error("❌ Error fetching subjects!");
            }
        }
        fetchSubjects();
    }, [classNumber]);

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
                } else toast.error("❌ Failed to load chapters!");
            } catch (error) {
                toast.error("❌ Error fetching chapters!");
            }
        }
        fetchChapters();
    }, [classNumber, subject]);

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
                    toast.error(`❌ No questions found for Class ${classNumber}, Subject ${subject}, Chapter ${chapterNumber}, Type ${examType}!`);
                }
            } catch (error) {
                toast.error("❌ Fetch error!");
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, [examType, classNumber, subject, chapterNumber]);

    useEffect(() => {
        const filtered = questions.filter(q => {
            if (!q) return false;
            if (examType === "MCQ") return q.question?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            if (examType === "CQ") return q.passage?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
            if (examType === "SQ") return q.question?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
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
        if (!examTitle.trim()) return toast.error("❌ Exam title is required!");
        if (!examType) return toast.error("❌ Exam type is required!");
        if (!duration || duration <= 0) return toast.error("❌ Duration must be positive!");
        if (!classNumber) return toast.error("❌ Class is required!");
        if (!subject) return toast.error("❌ Subject is required!");
        if (!chapterNumber) return toast.error("❌ Chapter is required!");
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
                toast.success("✅ Exam created successfully!");
                resetForm();
            } else toast.error("❌ Failed to create exam!");
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <Navbar />
            <div className="max-w-6xl mx-auto py-16 px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all hover:shadow-3xl">
                    <h2 className="text-4xl font-bold mb-10 text-center text-indigo-700 tracking-wide">
                        📝 Create Your Exam
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Exam Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter exam title"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                    value={examTitle}
                                    onChange={(e) => setExamTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 60"
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Class</label>
                                <select
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
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
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Subject</label>
                                <select
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all disabled:bg-gray-100"
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
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Chapter</label>
                                <select
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all disabled:bg-gray-100"
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

                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Exam Type</label>
                            <select
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
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

                        {examType && classNumber && subject && chapterNumber && (
                            <div className="mt-10 bg-indigo-50 p-6 rounded-2xl shadow-inner">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-semibold text-indigo-800">📚 Select Questions</h3>
                                    <div className="flex space-x-4">
                                        <input
                                            type="text"
                                            placeholder="Search questions..."
                                            className="w-1/3 p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="flex justify-center py-6">
                                        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                ) : filteredQuestions.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q._id}
                                                className="border border-indigo-200 p-5 rounded-xl bg-white hover:bg-indigo-50 transition-all shadow-md"
                                            >
                                                <label className="flex items-start space-x-4">
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => handleSelect(q)}
                                                        checked={selectedQuestions.some(sel => sel._id === q._id)}
                                                        className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        {examType === "MCQ" && (
                                                            <>
                                                                <p className="font-semibold text-gray-900">{q.question}</p>
                                                                <ul className="list-disc ml-6 text-sm text-gray-700 mt-2">
                                                                    {q.options?.map((opt, idx) => (
                                                                        <li key={idx}>{opt}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                        {examType === "CQ" && (
                                                            <>
                                                                <p className="font-semibold text-gray-900">{q.passage}</p>
                                                                <ul className="list-disc ml-6 text-sm text-gray-700 mt-2">
                                                                    {q.questions?.map((cq, idx) => (
                                                                        <li key={idx}>{cq}</li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        )}
                                                        {examType === "SQ" && (
                                                            <p className="font-semibold text-gray-900">{q.question}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-red-600 text-center py-6">❌ No questions found for this filter.</p>
                                )}
                            </div>
                        )}

                        {selectedQuestions.length > 0 && (
                            <div className="mt-10 bg-green-50 p-6 rounded-2xl shadow-inner">
                                <h3 className="text-2xl font-semibold text-green-800 mb-6">👀 Selected Questions Preview</h3>
                                <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedQuestions.map((q) => (
                                        <div
                                            key={q._id}
                                            className="border border-green-200 p-5 rounded-xl bg-white shadow-md flex justify-between items-center"
                                        >
                                            <div>
                                                {examType === "MCQ" && <p className="font-semibold text-gray-900">{q.question}</p>}
                                                {examType === "CQ" && <p className="font-semibold text-gray-900">{q.passage}</p>}
                                                {examType === "SQ" && <p className="font-semibold text-gray-900">{q.question}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleSelect(q)}
                                                className="text-red-600 text-sm font-medium hover:text-red-800 transition"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-4 mt-10 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1"
                            disabled={loading}
                        >
                            ✅ Create Exam Now
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
            <Footer />
        </div>
    );
}