import { useEffect, useState } from "react";

export default function ViewQuestionsAdmin() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");

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

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">📚 Teacher Dashboard</h1>

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
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mt-2">{q.question}</p>
                                        <ul className="list-disc ml-6 mt-2 text-gray-700">
                                            {q.options?.map((opt, i) => (
                                                <li key={i} className={`p-2 rounded ${i === q.correctAnswer ? "bg-green-200 font-bold" : ""}`}>
                                                    {opt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* CQ Questions */}
                                {q.type === "cq" && (
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900 mt-2">{q.passage || "No passage provided"}</p>
                                        <table className="w-full mt-3 border-collapse border border-gray-300">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="border p-2 text-left">Question</th>
                                                    <th className="border p-2 text-left">Answer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {q.questions?.map((quest, i) => (
                                                    <tr key={i} className="hover:bg-gray-100">
                                                        <td className="border p-2">{quest}</td>
                                                        <td className="border p-2">{q.answers?.[i] || "No answer provided"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Other Questions (SQ, etc.) */}
                                {q.type === "sq" && (
                                    <p className="text-lg font-semibold text-gray-900 mt-2">{q.question || "No question provided"}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 italic">No questions found. Try a different filter or search query.</p>
                    )}
                </div>
            )}
        </div>
    );
}
