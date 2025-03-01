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
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!examType) return;

        async function fetchQuestions() {
            setLoading(true);
            setQuestions([]);
            setSelectedQuestions([]);

            try {
                const response = await fetch(`/api/exam/questions?type=${examType}`);
                const data = await response.json();

                if (response.ok) {
                    setQuestions(Array.isArray(data.questions) ? data.questions : []);
                } else {
                    toast.error("❌ প্রশ্ন লোড করতে সমস্যা হয়েছে!");
                }
            } catch (error) {
                console.error("❌ Fetch error:", error);
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, [examType]);

    const handleSelect = (question) => {
        setSelectedQuestions((prev) =>
            prev.some(q => q._id === question._id)
                ? prev.filter(q => q._id !== question._id)
                : [...prev, question]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!examTitle || !examType || !duration || selectedQuestions.length === 0) {
            return toast.error("❌ পরীক্ষার শিরোনাম, ধরন, সময়সীমা এবং অন্তত একটি প্রশ্ন নির্বাচন করুন!");
        }

        const examData = { title: examTitle, type: examType, duration, questions: selectedQuestions };

        const response = await fetch("/api/exam", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(examData),
        });

        if (response.ok) {
            toast.success("✅ পরীক্ষা সফলভাবে তৈরি হয়েছে!");
            setExamTitle("");
            setExamType("");
            setDuration("");
            setQuestions([]);
            setSelectedQuestions([]);
        } else {
            toast.error("❌ কিছু সমস্যা হয়েছে!");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto py-16 my-16 p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📚 পরীক্ষা তৈরি করুন</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="📌 পরীক্ষার শিরোনাম"
                        className="w-full p-2 border rounded mb-4"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        required
                    />

                    <select
                        className="w-full p-2 border rounded mb-4"
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                    >
                        <option value="">📌 পরীক্ষার ধরন নির্বাচন করুন</option>
                        <option value="MCQ">MCQ</option>
                        <option value="CQ">CQ</option>
                        <option value="SQ">SQ</option>
                    </select>

                    <input
                        type="number"
                        placeholder="⏳ সময়সীমা (মিনিটে)"
                        className="w-full p-2 border rounded mb-4"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                    />

                    {examType && (
                        <div>
                            <h3 className="text-lg font-bold mb-2">📝 প্রশ্ন নির্বাচন করুন</h3>
                            {loading ? (
                                <p>🔄 প্রশ্ন লোড হচ্ছে...</p>
                            ) : questions.length > 0 ? (
                                questions.map((q) => (
                                    <div key={q._id} className="mb-4 border p-2 rounded">
                                        <label className="flex items-start">
                                            <input
                                                type="checkbox"
                                                onChange={() => handleSelect(q)}
                                                checked={selectedQuestions.some(sel => sel._id === q._id)}
                                                className="mr-2"
                                            />
                                            <div>
                                                {examType === "MCQ" && (
                                                    <div>
                                                        <p className="font-bold">{q.question}</p>
                                                        <ul className="list-disc ml-6">
                                                            {q.options?.map((opt, index) => (
                                                                <li key={index}>{opt}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {examType === "CQ" && (
                                                    <div>
                                                        <p className="font-bold">{q.passage}</p>
                                                        <ul className="list-disc ml-6">
                                                            {q.questions?.map((cqQ, index) => (
                                                                <li key={index}>{cqQ}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {examType === "SQ" && (
                                                    <p className="font-bold">{q.question}</p>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p>❌ কোনো প্রশ্ন পাওয়া যায়নি।</p>
                            )}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition font-bold">
                        ✅ পরীক্ষা তৈরি করুন
                    </button>
                </form>
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            </div>
            <Footer />
        </div>
    );
}