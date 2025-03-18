import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import React from "react";

export default function ViewQuestionsAdmin() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [editingSQ, setEditingSQ] = useState(null); // Track the SQ being edited


    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this CQ?")) {
            console.log("❌ Delete action canceled by user.");
            return;
        }

        try {
            console.log("📡 Sending DELETE request to:", `/api/cq/${id}`);
            const response = await fetch(`/api/cq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("CQ deleted successfully!");
                setQuestions((prev) => prev.filter((cq) => cq._id !== id));
            } else {
                toast.error(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            toast.error("❌ Server error!");
        }
    };

    const saveEdit = async (cq) => {
        try {
            console.log("📝 Editing CQ:", cq);

            const response = await fetch(`/api/cq/${cq._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...cq, _id: undefined }), // Prevent _id issues
            });

            console.log("📡 Sent PUT request to:", `/api/cq/${cq._id}`);

            const data = await response.json();
            console.log("🔄 Response:", data);

            if (response.ok) {
                toast.success("✅ CQ updated successfully!");
                setEditingCQ(null);
                setQuestions((prev) => prev.map((item) => (item._id === cq._id ? { ...item, ...cq } : item)));
            } else {
                toast.error(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error("🚨 Error editing CQ:", error);
            toast.error("❌ Server error!");
        }
    };

    const [editingCQ, setEditingCQ] = useState(null);

    const handleEdit = (cq) => {
        setEditingCQ(cq);
    };



    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/questions?type=${type}&search=${search}`);
                const data = await res.json();
                console.log("API Response:", data);
                if (data.success) {
                    setQuestions(data.data);
                } else {
                    setQuestions([]);
                }
            } catch (error) {
                console.error("Failed to fetch questions", error);
                setQuestions([]);
            }
            setLoading(false);
        };
        fetchQuestions();
    }, [type, search]);

    const handleDeleteMCQ = async (id) => {
        console.log("🛑 handleDeleteMCQ called with ID:", id); // Debugging

        if (!confirm("Are you sure you want to delete this MCQ?")) {
            console.log("❌ Delete action canceled by user.");
            return;
        }

        try {
            console.log("📡 Sending DELETE request to:", `/api/mcq/${id}`);
            const response = await fetch(`/api/mcq/${id}`, { method: "DELETE" });
            const data = await response.json();
            if (response.ok) {
                toast.success("MCQ deleted successfully!");
                setQuestions((prev) => prev.filter((mcq) => mcq._id !== id)); // Update the questions state
            } else {
                toast.error(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error("🚨 Error deleting MCQ:", error);
            toast.error("❌ Server error!");
        }
    };
    const handleEditMCQ = (mcq) => {
        console.log("📝 Editing MCQ:", mcq); // Debugging
        setEditingQuestion(mcq); // Open the edit form for the selected MCQ
    };
    const saveEditMCQ = async (updatedMCQ) => {
        try {
            const response = await fetch(`/api/mcq/${updatedMCQ._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedMCQ),
            });
            if (response.ok) {
                toast.success("✅ MCQ updated successfully!");
                setQuestions((prev) =>
                    prev.map((mcq) => (mcq._id === updatedMCQ._id ? updatedMCQ : mcq))
                );
                setEditingQuestion(null); // Close the modal
            } else {
                toast.error("❌ Failed to update MCQ!");
            }
        } catch (error) {
            console.error("🚨 Error updating MCQ:", error);
            toast.error("❌ Server error!");
        }
    };

    const cancelEdit = () => {
        setEditingQuestion(null); // Close the modal without saving changes
    };
    function EditModal({ question, onCancel, onSave }) {
        const [editedQuestion, setEditedQuestion] = useState({ ...question });

        const handleOptionChange = (index, value) => {
            const newOptions = [...editedQuestion.options];
            newOptions[index] = value;
            setEditedQuestion({ ...editedQuestion, options: newOptions });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(editedQuestion); // Save the updated MCQ
        };

        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4">✏️ Edit MCQ</h3>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={editedQuestion.question}
                            onChange={(e) =>
                                setEditedQuestion({ ...editedQuestion, question: e.target.value })
                            }
                            className="w-full p-2 border rounded mb-4"
                            required
                        />
                        {editedQuestion.options?.map((opt, i) => (
                            <div key={i} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={opt || ""}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    className="flex-1 p-2 border rounded"
                                    required
                                />
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={editedQuestion.correctAnswer === i}
                                    onChange={() =>
                                        setEditedQuestion({ ...editedQuestion, correctAnswer: i })
                                    }
                                    className="ml-2"
                                />
                            </div>
                        ))}
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    const handleEditSQ = (sq) => {
        console.log("📝 Editing SQ:", sq); // Debugging
        setEditingSQ(sq); // Open the edit modal or form for this SQ
    };
    const handleDeleteSQ = async (id) => {
        if (!confirm("Are you sure you want to delete this Simple Question?")) {
            return;
        }

        try {
            const response = await fetch(`/api/sq/${id}`, { method: "DELETE" }); // Make sure to set up the API route
            if (response.ok) {
                toast.success("Simple Question deleted successfully!");
                setQuestions((prev) => prev.filter((sq) => sq._id !== id)); // Update the state to remove deleted SQ
            } else {
                toast.error("❌ Failed to delete the Simple Question!");
            }
        } catch (error) {
            console.error("🚨 Error deleting SQ:", error);
            toast.error("❌ Server error!");
        }
    };
    function EditSQModal({ question, onCancel, onSave }) {
        const [editedSQ, setEditedSQ] = useState({ ...question });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(editedSQ); // Call the save function with the updated SQ
        };

        return (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4">✏️ Edit Simple Question</h3>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={editedSQ.question}
                            onChange={(e) => setEditedSQ({ ...editedSQ, question: e.target.value })}
                            className="w-full p-2 border rounded mb-4"
                            required
                        ></textarea>
                        <div className="flex justify-between mt-4">
                            <button
                                type="submit"
                                className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    const saveEditSQ = async (updatedSQ) => {
        try {
            const response = await fetch(`/api/sq/${updatedSQ._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSQ),
            });

            if (response.ok) {
                toast.success("Simple Question updated successfully!");
                setQuestions((prev) =>
                    prev.map((sq) => (sq._id === updatedSQ._id ? updatedSQ : sq))
                ); // Update the state with the edited SQ
                setEditingSQ(null); // Close the modal
            } else {
                toast.error("❌ Failed to update the Simple Question!");
            }
        } catch (error) {
            console.error("🚨 Error updating SQ:", error);
            toast.error("❌ Server error!");
        }
    };


    return (
        <div className="p-6 max-w-4xl mx-auto">
            <ToastContainer />
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📚 Admin Dashboard</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Select Type */}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                >
                    <option value="">All Questions</option>
                    <option value="mcq">MCQ</option>
                    <option value="cq">CQ</option>
                    <option value="sq">SQ</option>
                </select>

                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="🔍 Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-2/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* Loading Indicator */}
            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {questions.length > 0 ? (
                        questions.map((q) => (
                            <div
                                key={q._id}
                                className="border border-gray-200 p-5 rounded-lg shadow-lg bg-white hover:shadow-xl transition-all"
                            >
                                <p className="text-sm font-semibold text-blue-600">{q.type?.toUpperCase()}</p>

                                {/* MCQ Questions */}
                                {q.type === "mcq" && (
                                    <>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mt-2">{q.question}</p>

                                            {q.options?.length === 4 ? (
                                                // Layout for exactly 4 options
                                                <div className="flex ml-6 mt-4 text-gray-700 gap-16">
                                                    <div>
                                                        {q.options?.[0] && (
                                                            <p className={q.correctAnswer === 0 ? "bg-green-200 font-bold" : ""}>
                                                                ক. {q.options[0]}
                                                            </p>
                                                        )}
                                                        {q.options?.[1] && (
                                                            <p className={q.correctAnswer === 1 ? "bg-green-200 font-bold mt-2" : "mt-2"}>
                                                                খ. {q.options[1]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {q.options?.[2] && (
                                                            <p className={q.correctAnswer === 2 ? "bg-green-200 font-bold mx-2" : "mx-2"}>
                                                                গ. {q.options[2]}
                                                            </p>
                                                        )}
                                                        {q.options?.[3] && (
                                                            <p className={q.correctAnswer === 3 ? "bg-green-200 font-bold mx-2 mt-2" : "mt-2 mx-2"}>
                                                                ঘ. {q.options[3]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                // Layout for more than 4 options
                                                <ul className="list-disc ml-6 mt-2 text-gray-700">
                                                    <div className="mb-3">
                                                        {q.options?.[0] && <p>ক. {q.options[0]}</p>}
                                                        {q.options?.[1] && <p>খ. {q.options[1]}</p>}
                                                        {q.options?.[2] && <p>গ. {q.options[2]}</p>}
                                                    </div>
                                                    <p className="font-bold">নিচের কোনটি সঠিক?</p>
                                                    <div className="flex gap-16">
                                                        <div>
                                                            {q.options?.[3] && (
                                                                <p className={q.correctAnswer === 3 ? "bg-green-200 font-bold" : ""}>
                                                                    ক. {q.options[3]}
                                                                </p>
                                                            )}
                                                            {q.options?.[4] && (
                                                                <p className={q.correctAnswer === 4 ? "bg-green-200 font-bold mt-2" : "mt-2"}>
                                                                    খ. {q.options[4]}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {q.options?.[5] && (
                                                                <p className={q.correctAnswer === 5 ? "bg-green-200 font-bold mx-2" : "mx-2"}>
                                                                    গ. {q.options[5]}
                                                                </p>
                                                            )}
                                                            {q.options?.[6] && (
                                                                <p className={q.correctAnswer === 6 ? "bg-green-200 font-bold mx-2 mt-2" : "mt-2 mx-2"}>
                                                                    ঘ. {q.options[6]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </ul>
                                            )}

                                            {/* Add Edit and Delete Buttons */}
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    className="mr-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                                                    onClick={() => handleEditMCQ(q)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                                                    onClick={() => handleDeleteMCQ(q._id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* CQ Questions */}
                                {q.type === "cq" && (
                                    <div className="bg-white p-4 rounded shadow-md mt-3">
                                        <p className="text-gray-700 font-semibold mb-4">উদ্দীপকঃ</p>
                                        {q.passage && (
                                            <p className="text-lg font-semibold text-gray-900 mb-4">
                                                {q.passage || ""}
                                            </p>
                                        )}

                                        {/* Display the image if available */}
                                        {q.imageId && (
                                            <div className="mb-4">
                                                <img
                                                    src={`/api/image/${q.imageId}`} // Endpoint serves the image
                                                    alt="CQ related visual"
                                                    className="rounded shadow-md max-h-64"
                                                />
                                            </div>
                                        )}

                                        {/* Display the questions */}
                                        <div className="text-gray-900 text-lg">
                                            {q.questions?.[0] && <p className="mb-2">ক) {q.questions[0]}</p>}
                                            {q.questions?.[1] && <p className="mb-2">খ) {q.questions[1]}</p>}
                                            {q.questions?.[2] && <p className="mb-2">গ) {q.questions[2]}</p>}
                                            {q.questions?.[3] && <p className="mb-2">ঘ) {q.questions[3]}</p>}
                                        </div>

                                        {/* Add Edit and Delete Buttons */}
                                        <div className="flex justify-end mt-4">
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                                                onClick={() => handleEdit(q)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                onClick={() => handleDelete(q._id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Other Questions (SQ, etc.) */}
                                {q.type === "sq" && (
                                    <>
                                        <p className="text-lg font-semibold text-gray-900 mt-2">
                                            {q.question || "No question provided"}
                                        </p>
                                        {/* Add Edit and Delete Buttons */}
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                className="mr-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                                                onClick={() => handleEditSQ(q)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                                                onClick={() => handleDeleteSQ(q._id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic">No questions found. Try a different filter or search query.</p>
                    )}
                </div>
            )}
            {editingCQ && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate__animated animate__fadeIn">
                        <h3 className="text-lg font-semibold mb-4">Edit CQ</h3>
                        <textarea
                            className="w-full p-2 border rounded mb-2"
                            value={editingCQ.passage}
                            onChange={(e) =>
                                setEditingCQ({ ...editingCQ, passage: e.target.value })
                            }
                        />
                        {editingCQ.questions.map((question, index) => (
                            <input
                                key={index}
                                className="w-full p-2 border rounded mb-2"
                                value={question}
                                onChange={(e) => {
                                    const updatedQuestions = [...editingCQ.questions];
                                    updatedQuestions[index] = e.target.value;
                                    setEditingCQ({ ...editingCQ, questions: updatedQuestions });
                                }}
                            />
                        ))}
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                                onClick={() => saveEdit(editingCQ)}
                            >
                                💾 Save
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={() => setEditingCQ(null)}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editingQuestion && (
                <EditModal
                    question={editingQuestion}
                    onCancel={cancelEdit}
                    onSave={saveEditMCQ}
                />
            )}
            {editingSQ && (
                <EditSQModal
                    question={editingSQ}
                    onCancel={() => setEditingSQ(null)} // Close the modal
                    onSave={saveEditSQ} // Save the updated SQ
                />
            )}

        </div>
    );
}
