"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import dynamic from "next/dynamic";

const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });
const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });

export default function ViewQuestionsTeacher() {
    const { data: session } = useSession();
    const teacherEmail = session?.user?.email || null;

    useEffect(() => {
        (async () => {
            const { addStyles } = await import("react-mathquill");
            addStyles();
        })();
    }, []);

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [editingMCQ, setEditingMCQ] = useState(null);
    const [editingCQ, setEditingCQ] = useState(null);
    const [editingSQ, setEditingSQ] = useState(null);

    useEffect(() => {
        if (!teacherEmail) return;

        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/teacher/questions?type=${type}&search=${encodeURIComponent(search)}&teacherEmail=${encodeURIComponent(teacherEmail)}`
                );
                const data = await res.json();
                console.log("API Response:", data);
                if (data.success) {
                    setQuestions(data.data || []);
                } else {
                    setQuestions([]);
                    toast.error("প্রশ্ন লোড করতে ব্যর্থ!");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setQuestions([]);
                toast.error("সার্ভারে ত্রুটি!");
            }
            setLoading(false);
        };
        fetchQuestions();
    }, [type, search, teacherEmail]);

    // Delete Handlers
    const handleDeleteMCQ = async (id) => {
        if (!confirm("আপনি কি এই এমসিকিউ মুছতে চান?")) return;
        try {
            const response = await fetch(`/api/mcq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("এমসিকিউ সফলভাবে মুছে ফেলা হয়েছে!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "এমসিকিউ মুছতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Delete MCQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    const handleDeleteCQ = async (id) => {
        if (!confirm("আপনি কি এই সৃজনশীল প্রশ্ন মুছতে চান?")) return;
        try {
            const response = await fetch(`/api/cq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("সৃজনশীল প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "সৃজনশীল প্রশ্ন মুছতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Delete CQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    const handleDeleteSQ = async (id) => {
        if (!confirm("আপনি কি এই সংক্ষিপ্ত প্রশ্ন মুছতে চান?")) return;
        try {
            const response = await fetch(`/api/sq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("সংক্ষিপ্ত প্রশ্ন সফলভাবে মুছে ফেলা হয়েছে!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "সংক্ষিপ্ত প্রশ্ন মুছতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Delete SQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    // Edit Handlers
    const handleEditMCQ = (mcq) => setEditingMCQ(mcq);
    const handleEditCQ = (cq) => setEditingCQ(cq);
    const handleEditSQ = (sq) => setEditingSQ(sq);

    const saveEditMCQ = async (updatedMCQ) => {
        try {
            const response = await fetch(`/api/mcq/${updatedMCQ._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedMCQ),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("✅ এমসিকিউ সফলভাবে আপডেট করা হয়েছে!");
                setQuestions((prev) => prev.map((q) => (q._id === updatedMCQ._id ? updatedMCQ : q)));
                setEditingMCQ(null);
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "এমসিকিউ আপডেট করতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Update MCQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    const saveEditCQ = async (updatedCQ) => {
        try {
            const response = await fetch(`/api/cq/${updatedCQ._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updatedCQ, _id: undefined }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("✅ সৃজনশীল প্রশ্ন সফলভাবে আপডেট করা হয়েছে!");
                setQuestions((prev) => prev.map((q) => (q._id === updatedCQ._id ? updatedCQ : q)));
                setEditingCQ(null);
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "সৃজনশীল প্রশ্ন আপডেট করতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Update CQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    const saveEditSQ = async (updatedSQ) => {
        try {
            const response = await fetch(`/api/sq/${updatedSQ._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSQ),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে আপডেট করা হয়েছে!");
                setQuestions((prev) => prev.map((q) => (q._id === updatedSQ._id ? updatedSQ : q)));
                setEditingSQ(null);
            } else {
                toast.error(`❌ ত্রুটি: ${data.error || "সংক্ষিপ্ত প্রশ্ন আপডেট করতে ব্যর্থ"}`);
            }
        } catch (error) {
            console.error("Update SQ error:", error);
            toast.error("❌ সার্ভারে ত্রুটি!");
        }
    };

    // Edit Modals
    function EditMCQModal({ question, onCancel, onSave }) {
        const [editedMCQ, setEditedMCQ] = useState({ ...question });

        const handleOptionChange = (index, value) => {
            const newOptions = [...(editedMCQ.options || [])];
            newOptions[index] = value;
            setEditedMCQ({ ...editedMCQ, options: newOptions });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(editedMCQ);
        };

        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-3xl">
                    <h3 className="text-2xl font-bold mb-6 text-blue-700 bangla-text">✏️ এমসিকিউ সম্পাদনা করুন</h3>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">প্রশ্ন</label>
                        <EditableMathField
                            latex={editedMCQ.question || ""}
                            onChange={(mathField) => setEditedMCQ({ ...editedMCQ, question: mathField.latex() })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text mb-6"
                        />
                        {(editedMCQ.options || []).map((opt, i) => (
                            <div key={i} className="flex items-center mb-4">
                                <EditableMathField
                                    latex={opt || ""}
                                    onChange={(mathField) => handleOptionChange(i, mathField.latex())}
                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                />
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={editedMCQ.correctAnswer === i}
                                    onChange={() => setEditedMCQ({ ...editedMCQ, correctAnswer: i })}
                                    className="ml-4 h-5 w-5 text-blue-600"
                                />
                            </div>
                        ))}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">
                                ভিডিও লিঙ্ক (ঐচ্ছিক)
                            </label>
                            <input
                                type="url"
                                value={editedMCQ.videoLink || ""}
                                onChange={(e) => setEditedMCQ({ ...editedMCQ, videoLink: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition text-lg bangla-text"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition text-lg bangla-text"
                            >
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    function EditCQModal({ question, onCancel, onSave }) {
        const [editedCQ, setEditedCQ] = useState({ ...question });

        const handleQuestionChange = (index, value) => {
            const newQuestions = [...(editedCQ.questions || [])];
            newQuestions[index] = value;
            setEditedCQ({ ...editedCQ, questions: newQuestions });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(editedCQ);
        };

        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-3xl">
                    <h3 className="text-2xl font-bold mb-6 text-blue-700 bangla-text">✏️ সৃজনশীল প্রশ্ন সম্পাদনা করুন</h3>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">উদ্দীপক</label>
                        <EditableMathField
                            latex={editedCQ.passage || ""}
                            onChange={(mathField) => setEditedCQ({ ...editedCQ, passage: mathField.latex() })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text mb-6"
                        />
                        {(editedCQ.questions || []).map((q, i) => (
                            <div key={i} className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">
                                    প্রশ্ন {String.fromCharCode(2453 + i)}
                                </label>
                                <EditableMathField
                                    latex={q || ""}
                                    onChange={(mathField) => handleQuestionChange(i, mathField.latex())}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                />
                            </div>
                        ))}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">
                                ভিডিও লিঙ্ক (ঐচ্ছিক)
                            </label>
                            <input
                                type="url"
                                value={editedCQ.videoLink || ""}
                                onChange={(e) => setEditedCQ({ ...editedCQ, videoLink: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition text-lg bangla-text"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition text-lg bangla-text"
                            >
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    function EditSQModal({ question, onCancel, onSave }) {
        const [editedSQ, setEditedSQ] = useState({ ...question });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(editedSQ);
        };

        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
                <div className="p-8 bg-white rounded-xl shadow-2xl w-full max-w-3xl">
                    <h3 className="text-2xl font-bold mb-6 text-blue-700 bangla-text">✏️ সংক্ষিপ্ত প্রশ্ন সম্পাদনা করুন</h3>
                    <form onSubmit={handleSubmit}>
                        <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">প্রশ্নের ধরণ</label>
                        <select
                            value={editedSQ.type || "জ্ঞানমূলক"}
                            onChange={(e) => setEditedSQ({ ...editedSQ, type: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text mb-6"
                            required
                        >
                            <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                            <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                            <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                            <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                        </select>
                        <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">প্রশ্ন</label>
                        <EditableMathField
                            latex={editedSQ.question || ""}
                            onChange={(mathField) => setEditedSQ({ ...editedSQ, question: mathField.latex() })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text mb-6"
                        />
                        <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">উত্তর (ঐচ্ছিক)</label>
                        <EditableMathField
                            latex={editedSQ.answer || ""}
                            onChange={(mathField) => setEditedSQ({ ...editedSQ, answer: mathField.latex() })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text mb-6"
                        />
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2 text-lg bangla-text">
                                ভিডিও লিঙ্ক (ঐচ্ছিক)
                            </label>
                            <input
                                type="url"
                                value={editedSQ.videoLink || ""}
                                onChange={(e) => setEditedSQ({ ...editedSQ, videoLink: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition text-lg bangla-text"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition text-lg bangla-text"
                            >
                                সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML" async></script>
                <style>{`
                    .bangla-text { font-family: 'Noto Sans Bengali', sans-serif; }
                    .video-link { color: #1a73e8; text-decoration: underline; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.375rem; transition: background-color 0.2s; }
                    .video-link:hover { background-color: #e8f0fe; }
                    .math-field { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.75rem; background: white; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
                `}</style>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-8">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
                <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-700 bangla-text">📚 শিক্ষকের প্রশ্ন দেখুন</h1>

                {!teacherEmail ? (
                    <p className="text-center text-red-500 text-lg bangla-text">অনুগ্রহ করে লগইন করুন!</p>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-6 mb-10">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full md:w-1/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                            >
                                <option value="">সব প্রশ্ন</option>
                                <option value="mcq">এমসিকিউ</option>
                                <option value="cq">সৃজনশীল প্রশ্ন</option>
                                <option value="sq">সংক্ষিপ্ত প্রশ্ন</option>
                            </select>
                            <input
                                type="text"
                                placeholder="🔍 প্রশ্ন খুঁজুন..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full md:w-2/3 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                            />
                        </div>

                        {/* Loading Indicator */}
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {questions.length > 0 ? (
                                    questions.map((q) => (
                                        <div
                                            key={q._id}
                                            className="border border-gray-200 p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition-all"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded bangla-text">
                                                    {q.type ? q.type.toUpperCase() : "Unknown"}
                                                </span>
                                                <div className="space-x-3">
                                                    <button
                                                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-lg bangla-text"
                                                        onClick={() =>
                                                            q.type === "mcq"
                                                                ? handleEditMCQ(q)
                                                                : q.type === "cq"
                                                                ? handleEditCQ(q)
                                                                : handleEditSQ(q)
                                                        }
                                                    >
                                                        ✏️ সম্পাদনা
                                                    </button>
                                                    <button
                                                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition text-lg bangla-text"
                                                        onClick={() =>
                                                            q.type === "mcq"
                                                                ? handleDeleteMCQ(q._id)
                                                                : q.type === "cq"
                                                                ? handleDeleteCQ(q._id)
                                                                : handleDeleteSQ(q._id)
                                                        }
                                                    >
                                                        🗑️ মুছুন
                                                    </button>
                                                </div>
                                            </div>

                                            {/* MCQ Display */}
                                            {q.type === "mcq" && (
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">প্রশ্ন:</p>
                                                    <StaticMathField className="text-gray-700 mb-4 bangla-text">
                                                        {q.question || "কোনো প্রশ্ন দেওয়া হয়নি"}
                                                    </StaticMathField>
                                                    {q.imageId && (
                                                        <div
                                                            className={`mb-4 ${
                                                                q.imageAlignment === "left"
                                                                    ? "text-left"
                                                                    : q.imageAlignment === "right"
                                                                    ? "text-right"
                                                                    : "text-center"
                                                            }`}
                                                        >
                                                            <img
                                                                src={`/api/image/${q.imageId}?type=mcq`}
                                                                alt="MCQ related visual"
                                                                className="rounded-lg shadow-md max-h-48 inline-block"
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        </div>
                                                    )}
                                                    {q.videoLink && (
                                                        <div className="mb-4">
                                                            <a
                                                                href={q.videoLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="video-link bangla-text"
                                                            >
                                                                📹 ভিডিও দেখুন
                                                            </a>
                                                        </div>
                                                    )}
                                                    {(q.options || []).length === 4 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                            {(q.options || []).map((opt, i) => (
                                                                <p
                                                                    key={i}
                                                                    className={`text-gray-700 bangla-text ${
                                                                        q.correctAnswer === i ? "font-bold text-green-600" : ""
                                                                    }`}
                                                                >
                                                                    {String.fromCharCode(2453 + i)}.{" "}
                                                                    <StaticMathField className="inline-block">{opt || "N/A"}</StaticMathField>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="mb-3 text-gray-700">
                                                                {(q.options || []).slice(0, 3).map((opt, i) => (
                                                                    <p key={i} className="bangla-text">
                                                                        {String.fromCharCode(2453 + i)}.{" "}
                                                                        <StaticMathField className="inline-block">
                                                                            {opt || "N/A"}
                                                                        </StaticMathField>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                            <p className="font-bold mb-2 bangla-text">নিচের কোনটি সঠিক?</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                                {(q.options || []).slice(3).map((opt, i) => (
                                                                    <p
                                                                        key={i + 3}
                                                                        className={`text-gray-700 bangla-text ${
                                                                            q.correctAnswer === i + 3 ? "font-bold text-green-600" : ""
                                                                        }`}
                                                                    >
                                                                        {String.fromCharCode(2453 + i)}.{" "}
                                                                        <StaticMathField className="inline-block">
                                                                            {opt || "N/A"}
                                                                        </StaticMathField>
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-4 bangla-text">
                                                        ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়:{" "}
                                                        {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.questionType || "N/A"}
                                                    </p>
                                                </div>
                                            )}

                                            {/* CQ Display */}
                                            {q.type === "cq" && (
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                                                    <StaticMathField className="text-gray-700 mb-4 bangla-text">
                                                        {q.passage || "কোনো উদ্দীপক দেওয়া হয়নি"}
                                                    </StaticMathField>
                                                    {q.imageId && (
                                                        <div
                                                            className={`mb-4 ${
                                                                q.imageAlignment === "left"
                                                                    ? "text-left"
                                                                    : q.imageAlignment === "right"
                                                                    ? "text-right"
                                                                    : "text-center"
                                                            }`}
                                                        >
                                                            <img
                                                                src={`/api/image/${q.imageId}?type=cq`}
                                                                alt="CQ related visual"
                                                                className="rounded-lg shadow-md max-h-64 inline-block"
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        </div>
                                                    )}
                                                    {q.videoLink && (
                                                        <div className="mb-4">
                                                            <a
                                                                href={q.videoLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="video-link bangla-text"
                                                            >
                                                                📹 ভিডিও দেখুন
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="text-gray-700">
                                                        {(q.questions || []).map((ques, i) => (
                                                            <p key={i} className="mb-3 bangla-text">
                                                                {String.fromCharCode(2453 + i)}) <StaticMathField className="inline-block">{ques || "N/A"}</StaticMathField>{" "}
                                                                {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                                                            </p>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-4 bangla-text">
                                                        ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়:{" "}
                                                        {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.cqType || "N/A"}
                                                    </p>
                                                </div>
                                            )}

                                            {/* SQ Display */}
                                            {q.type === "sq" && (
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                                                        {q.type ? `${q.type}: ` : ""}
                                                        <StaticMathField className="inline-block">
                                                            {q.question || "কোনো প্রশ্ন দেওয়া হয়নি"}
                                                        </StaticMathField>
                                                    </p>
                                                    {q.imageId && (
                                                        <div
                                                            className={`mb-4 ${
                                                                q.imageAlignment === "left"
                                                                    ? "text-left"
                                                                    : q.imageAlignment === "right"
                                                                    ? "text-right"
                                                                    : "text-center"
                                                            }`}
                                                        >
                                                            <img
                                                                src={`/api/image/${q.imageId}?type=sq`}
                                                                alt="SQ related visual"
                                                                className="rounded-lg shadow-md max-h-48 inline-block"
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        </div>
                                                    )}
                                                    {q.videoLink && (
                                                        <div className="mb-4">
                                                            <a
                                                                href={q.videoLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="video-link bangla-text"
                                                            >
                                                                📹 ভিডিও দেখুন
                                                            </a>
                                                        </div>
                                                    )}
                                                    {q.answer && (
                                                        <div className="text-gray-700 mb-4">
                                                            <span className="font-semibold bangla-text">উত্তর: </span>
                                                            <StaticMathField className="inline-block bangla-text">{q.answer}</StaticMathField>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-4 bangla-text">
                                                        ক্লাস: {q.classLevel || "N/A"} | বিষয়: {q.subjectName || "N/A"} | অধ্যায়:{" "}
                                                        {q.chapterName || "N/A"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 text-lg italic py-8 bangla-text">
                                        কোনো প্রশ্ন পাওয়া যায়নি। অন্য ফিল্টার বা সার্চ ব্যবহার করুন।
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Edit Modals */}
                        {editingMCQ && <EditMCQModal question={editingMCQ} onCancel={() => setEditingMCQ(null)} onSave={saveEditMCQ} />}
                        {editingCQ && <EditCQModal question={editingCQ} onCancel={() => setEditingCQ(null)} onSave={saveEditCQ} />}
                        {editingSQ && <EditSQModal question={editingSQ} onCancel={() => setEditingSQ(null)} onSave={saveEditSQ} />}
                    </div>
                )}
            </div>
        </>
    );
}