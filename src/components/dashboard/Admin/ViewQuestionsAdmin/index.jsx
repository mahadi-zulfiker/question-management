"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ViewQuestionsAdmin() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [editingMCQ, setEditingMCQ] = useState(null); // For MCQ
    const [editingCQ, setEditingCQ] = useState(null); // For CQ
    const [editingSQ, setEditingSQ] = useState(null); // For SQ

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/questions?type=${type}&search=${encodeURIComponent(search)}`);
                const data = await res.json();
                console.log("API Response:", data);
                if (data.success) {
                    setQuestions(data.data || []);
                } else {
                    setQuestions([]);
                    toast.error("Failed to load questions!");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setQuestions([]);
                toast.error("Server error while fetching questions!");
            }
            setLoading(false);
        };
        fetchQuestions();
    }, [type, search]);

    // Delete Handlers
    const handleDeleteMCQ = async (id) => {
        if (!confirm("Are you sure you want to delete this MCQ?")) return;
        try {
            const response = await fetch(`/api/mcq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("MCQ deleted successfully!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to delete MCQ"}`);
            }
        } catch (error) {
            console.error("Delete MCQ error:", error);
            toast.error("❌ Server error!");
        }
    };

    const handleDeleteCQ = async (id) => {
        if (!confirm("Are you sure you want to delete this CQ?")) return;
        try {
            const response = await fetch(`/api/cq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("CQ deleted successfully!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to delete CQ"}`);
            }
        } catch (error) {
            console.error("Delete CQ error:", error);
            toast.error("❌ Server error!");
        }
    };

    const handleDeleteSQ = async (id) => {
        if (!confirm("Are you sure you want to delete this SQ?")) return;
        try {
            const response = await fetch(`/api/sq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("SQ deleted successfully!");
                setQuestions((prev) => prev.filter((q) => q._id !== id));
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to delete SQ"}`);
            }
        } catch (error) {
            console.error("Delete SQ error:", error);
            toast.error("❌ Server error!");
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
                toast.success("✅ MCQ updated successfully!");
                setQuestions((prev) =>
                    prev.map((q) => (q._id === updatedMCQ._id ? { ...updatedMCQ } : q))
                );
                setEditingMCQ(null);
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to update MCQ"}`);
            }
        } catch (error) {
            console.error("Update MCQ error:", error);
            toast.error("❌ Server error!");
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
                toast.success("✅ CQ updated successfully!");
                setQuestions((prev) =>
                    prev.map((q) => (q._id === updatedCQ._id ? { ...updatedCQ } : q))
                );
                setEditingCQ(null);
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to update CQ"}`);
            }
        } catch (error) {
            console.error("Update CQ error:", error);
            toast.error("❌ Server error!");
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
                toast.success("✅ SQ updated successfully!");
                setQuestions((prev) =>
                    prev.map((q) => (q._id === updatedSQ._id ? { ...updatedSQ } : q))
                );
                setEditingSQ(null);
            } else {
                toast.error(`❌ Error: ${data.error || "Failed to update SQ"}`);
            }
        } catch (error) {
            console.error("Update SQ error:", error);
            toast.error("❌ Server error!");
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
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">✏️ Edit MCQ</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={editedMCQ.question || ""}
                            onChange={(e) => setEditedMCQ({ ...editedMCQ, question: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                            placeholder="প্রশ্ন লিখুন"
                            required
                        />
                        {(editedMCQ.options || []).map((opt, i) => (
                            <div key={i} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={opt || ""}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                    placeholder={`বিকল্প ${i + 1}`}
                                    required
                                />
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={editedMCQ.correctAnswer === i}
                                    onChange={() => setEditedMCQ({ ...editedMCQ, correctAnswer: i })}
                                    className="ml-2"
                                />
                            </div>
                        ))}
                        <div className="flex justify-between mt-4">
                            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
                                Save
                            </button>
                            <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
                                Cancel
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
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">✏️ Edit CQ</h3>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={editedCQ.passage || ""}
                            onChange={(e) => setEditedCQ({ ...editedCQ, passage: e.target.value })}
                            className="w-full p-2 border rounded mb-4 h-24"
                            placeholder="উদ্দীপক"
                            required
                        />
                        {(editedCQ.questions || []).map((q, i) => (
                            <input
                                key={i}
                                type="text"
                                value={q || ""}
                                onChange={(e) => handleQuestionChange(i, e.target.value)}
                                className="w-full p-2 border rounded mb-2"
                                placeholder={`প্রশ্ন ${i + 1}`}
                                required
                            />
                        ))}
                        <div className="flex justify-between mt-4">
                            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
                                Save
                            </button>
                            <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
                                Cancel
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
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">✏️ Edit SQ</h3>
                    <form onSubmit={handleSubmit}>
                        <select
                            value={editedSQ.type || "জ্ঞানমূলক"}
                            onChange={(e) => setEditedSQ({ ...editedSQ, type: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                            required
                        >
                            <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                            <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                            <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                            <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                        </select>
                        <textarea
                            value={editedSQ.question || ""}
                            onChange={(e) => setEditedSQ({ ...editedSQ, question: e.target.value })}
                            className="w-full p-2 border rounded mb-4 h-24"
                            placeholder="প্রশ্ন লিখুন"
                            required
                        />
                        <textarea
                            value={editedSQ.answer || ""}
                            onChange={(e) => setEditedSQ({ ...editedSQ, answer: e.target.value })}
                            className="w-full p-2 border rounded mb-4 h-24"
                            placeholder="উত্তর (ঐচ্ছিক)"
                        />
                        <div className="flex justify-between mt-4">
                            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition">
                                Save
                            </button>
                            <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">📚 প্রশ্ন দেখুন</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                    <option value="">সব প্রশ্ন</option>
                    <option value="mcq">MCQ</option>
                    <option value="cq">CQ</option>
                    <option value="sq">SQ</option>
                </select>
                <input
                    type="text"
                    placeholder="🔍 প্রশ্ন খুঁজুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
            </div>

            {/* Loading Indicator */}
            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {questions.length > 0 ? (
                        questions.map((q) => (
                            <div
                                key={q._id}
                                className="border border-gray-200 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-all"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {q.type ? q.type.toUpperCase() : "Unknown"}
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                                            onClick={() => (q.type === "mcq" ? handleEditMCQ(q) : q.type === "cq" ? handleEditCQ(q) : handleEditSQ(q))}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                                            onClick={() => (q.type === "mcq" ? handleDeleteMCQ(q._id) : q.type === "cq" ? handleDeleteCQ(q._id) : handleDeleteSQ(q._id))}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                {/* MCQ Display */}
                                {q.type === "mcq" && (
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">{q.question || "No question provided"}</p>
                                        {q.imageId && (
                                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                                <img
                                                    src={`/api/image/${q.imageId}?type=mcq`}
                                                    alt="MCQ related visual"
                                                    className="rounded shadow-md max-h-48 inline-block"
                                                    onError={(e) => (e.target.style.display = "none")}
                                                />
                                            </div>
                                        )}
                                        {(q.options || []).length === 4 ? (
                                            <div className="grid grid-cols-2 gap-4 text-gray-700">
                                                {(q.options || []).map((opt, i) => (
                                                    <p
                                                        key={i}
                                                        className={q.correctAnswer === i ? "bg-green-100 font-bold p-2 rounded" : "p-2"}
                                                    >
                                                        {String.fromCharCode(2453 + i)}. {opt || "N/A"}
                                                    </p>
                                                ))}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="mb-3 text-gray-700">
                                                    {(q.options || []).slice(0, 3).map((opt, i) => (
                                                        <p key={i}>{String.fromCharCode(2453 + i)}. {opt || "N/A"}</p>
                                                    ))}
                                                </div>
                                                <p className="font-bold mb-2">নিচের কোনটি সঠিক?</p>
                                                <div className="grid grid-cols-2 gap-4 text-gray-700">
                                                    {(q.options || []).slice(3).map((opt, i) => (
                                                        <p
                                                            key={i + 3}
                                                            className={q.correctAnswer === i + 3 ? "bg-green-100 font-bold p-2 rounded" : "p-2"}
                                                        >
                                                            {String.fromCharCode(2453 + i)}. {opt || "N/A"}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Class: {q.classNumber || "N/A"} | Subject: {q.subject || "N/A"} | Chapter: {q.chapterName || "N/A"} | Type: {q.questionType || "N/A"}
                                        </p>
                                    </div>
                                )}

                                {/* CQ Display */}
                                {q.type === "cq" && (
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">উদ্দীপক:</p>
                                        <p className="text-gray-700 mb-4">{q.passage || "No passage provided"}</p>
                                        {q.imageId && (
                                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                                <img
                                                    src={`/api/image/${q.imageId}?type=cq`}
                                                    alt="CQ related visual"
                                                    className="rounded shadow-md max-h-64 inline-block"
                                                    onError={(e) => (e.target.style.display = "none")}
                                                />
                                            </div>
                                        )}
                                        <div className="text-gray-900">
                                            {(q.questions || []).map((ques, i) => (
                                                <p key={i} className="mb-2">
                                                    {String.fromCharCode(2453 + i)}) {ques || "N/A"} {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                                                </p>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Class: {q.classNumber || "N/A"} | Subject: {q.subject || "N/A"} | Chapter: {q.chapterName || "N/A"} | Type: {q.cqType || "N/A"}
                                        </p>
                                    </div>
                                )}

                                {/* SQ Display */}
                                {q.type === "sq" && (
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">
                                            {q.type ? `${q.type}: ` : ""}{q.question || "No question provided"}
                                        </p>
                                        {q.imageId && (
                                            <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                                <img
                                                    src={`/api/image/${q.imageId}?type=sq`}
                                                    alt="SQ related visual"
                                                    className="rounded shadow-md max-h-48 inline-block"
                                                    onError={(e) => (e.target.style.display = "none")}
                                                />
                                            </div>
                                        )}
                                        {q.answer && (
                                            <p className="text-gray-700 mb-4"><span className="font-semibold">উত্তর:</span> {q.answer}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">
                                            Class: {q.classLevel || "N/A"} | Subject: {q.subjectName || "N/A"} | Chapter: {q.chapterName || "N/A"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic py-6">কোনো প্রশ্ন পাওয়া যায়নি। অন্য ফিল্টার বা সার্চ ব্যবহার করুন।</p>
                    )}
                </div>
            )}

            {/* Edit Modals */}
            {editingMCQ && (
                <EditMCQModal question={editingMCQ} onCancel={() => setEditingMCQ(null)} onSave={saveEditMCQ} />
            )}
            {editingCQ && (
                <EditCQModal question={editingCQ} onCancel={() => setEditingCQ(null)} onSave={saveEditCQ} />
            )}
            {editingSQ && (
                <EditSQModal question={editingSQ} onCancel={() => setEditingSQ(null)} onSave={saveEditSQ} />
            )}
        </div>
    );
}