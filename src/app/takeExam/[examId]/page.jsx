"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TakeExam() {
    const router = useRouter();
    const { examId } = useParams();
    const { data: session } = useSession();
    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [warning, setWarning] = useState(false);
    const [clientReady, setClientReady] = useState(false);

    useEffect(() => {
        setClientReady(true);
    }, []);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await fetch(`/api/takeExam?examId=${examId}`);
                const data = await response.json();
                if (response.ok && data.exam) {
                    console.log("Fetched exam data:", JSON.stringify(data.exam, null, 2));
                    setExam({ ...data.exam });
                    setTimeLeft(Number(data.exam.duration) * 60);
                } else {
                    throw new Error(data.error || "Failed to fetch exam");
                }
            } catch (error) {
                toast.error(`❌ Error fetching exam: ${error.message}`);
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (examId) fetchExam();
    }, [examId]);

    useEffect(() => {
        if (!exam || !timeLeft) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 60) setWarning(true);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const handleAnswerChange = (questionId, value, subQuestionIndex = null) => {
        setAnswers((prev) => {
            console.log(`Updating answers for questionId: ${questionId}, subQuestionIndex: ${subQuestionIndex}, value: ${value}`);
            if (subQuestionIndex !== null) {
                // CQ: Update sub-question answers
                const currentAnswer = prev[questionId] || {};
                return {
                    ...prev,
                    [questionId]: {
                        ...currentAnswer,
                        [`subQuestion${subQuestionIndex + 1}`]: value,
                    },
                };
            } else {
                // MCQ and SQ: Update as a single value
                return {
                    ...prev,
                    [questionId]: value,
                };
            }
        });
    };

    const handleSubmit = async () => {
        if (!exam || !session?.user?.email) {
            toast.error("❌ Please log in to submit!");
            return;
        }
        try {
            const response = await fetch("/api/takeExam", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examId,
                    userEmail: session.user.email,
                    answers,
                }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("✅ পরীক্ষা সফলভাবে জমা হয়েছে!");
                router.push(`/takeExam/${examId}/submitted`);
            } else {
                toast.error(`❌ ${data.error || "Submission failed"}`);
            }
        } catch (error) {
            console.error("❌ Submit error:", error.message);
            toast.error(`❌ Submission failed: ${error.message}`);
        }
    };

    const progress = exam?.questions
        ? (Object.keys(answers).filter((id) => {
              const answer = answers[id];
              return exam.type === "CQ"
                  ? Object.keys(answer || {}).length > 0
                  : answer !== null && answer !== "";
          }).length / exam.questions.length) * 100
        : 0;

    if (loading || !clientReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 flex items-center justify-center">
                <p className="text-2xl text-blue-700 animate-pulse">🔄 Loading exam...</p>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 flex items-center justify-center">
                <p className="text-center text-red-600 text-2xl">❌ Exam not found!</p>
            </div>
        );
    }

    console.log("Rendering exam:", JSON.stringify(exam, null, 2));
    console.log("Exam questions:", JSON.stringify(exam.questions, null, 2));
    console.log("Questions condition:", {
        hasQuestions: !!exam?.questions,
        isArray: Array.isArray(exam?.questions),
        length: exam?.questions?.length,
    });

    return (
        <div key={examId} className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto py-20 px-6">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-blue-100">
                    <div>
                        <h2 className="text-4xl font-extrabold mb-8 text-indigo-900 drop-shadow-md">{exam.title}</h2>
                        <div className="mb-8">
                            <div className={`text-2xl font-semibold ${warning ? "text-red-600 animate-pulse" : "text-gray-700"} mb-2`}>
                                ⏳ Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                                {warning && " (Warning: Less than 1 minute!)"}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Progress: {progress.toFixed(0)}%</p>
                        </div>
                        <div className="space-y-8">
                            {exam.questions && exam.questions.length > 0 ? (
                                exam.questions.map((q, index) => {
                                    let questionType = q.type;
                                    if (!questionType) {
                                        if (q.passage && q.questions && q.answers && q.marks) {
                                            questionType = "CQ";
                                        } else if (q.options && Array.isArray(q.options) && q.question) {
                                            questionType = "MCQ";
                                        } else if (q.question && !q.options && !q.passage) {
                                            questionType = "SQ";
                                        } else {
                                            questionType = "unknown";
                                        }
                                    }
                                    console.log(`Rendering question ${q._id || index} with type: ${questionType}`, JSON.stringify(q, null, 2));
                                    return (
                                        <div
                                            key={q._id || index}
                                            className="border border-blue-100 p-6 rounded-2xl bg-white hover:bg-blue-50/50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
                                        >
                                            <p className="text-gray-500 mb-2">Question Type: {questionType}</p>

                                            {questionType === "MCQ" && (
                                                <>
                                                    <p className="text-xl font-semibold text-gray-900 mb-5">{q.question || "No question provided"}</p>
                                                    {q.options && Array.isArray(q.options) && q.options.length > 0 ? (
                                                        q.options.map((opt, optIndex) => (
                                                            <label key={optIndex} className="block mb-4">
                                                                <input
                                                                    type="radio"
                                                                    name={q._id || `mcq-${index}`}
                                                                    value={optIndex}
                                                                    checked={answers[q._id] === optIndex}
                                                                    onChange={() => handleAnswerChange(q._id || `mcq-${index}`, optIndex)}
                                                                    className="mr-4 text-blue-600 focus:ring-2 focus:ring-blue-400"
                                                                />
                                                                <span className="text-gray-800 text-lg">{opt || "No option text"}</span>
                                                            </label>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-lg">🔹 No options available</p>
                                                    )}
                                                </>
                                            )}
                                            {questionType === "CQ" && (
                                                <>
                                                    <p className="text-xl font-semibold text-gray-900 mb-4">{q.passage || "No passage provided"}</p>
                                                    {q.questions && Array.isArray(q.questions) && q.questions.length > 0 ? (
                                                        q.questions.map((subQuestion, subIndex) => (
                                                            <div key={subIndex} className="mb-6">
                                                                <p className="text-lg font-medium text-gray-800 mb-2">
                                                                    {subQuestion || "No sub-question provided"}{" "}
                                                                    <span className="text-blue-600">
                                                                        (Marks: {q.marks ? q.marks[subIndex] : 1})
                                                                    </span>
                                                                </p>
                                                                <textarea
                                                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800 resize-y"
                                                                    rows="4"
                                                                    placeholder={`Answer for question ${subIndex + 1}...`}
                                                                    value={answers[q._id]?.[`subQuestion${subIndex + 1}`] || ""}
                                                                    onChange={(e) =>
                                                                        handleAnswerChange(q._id, e.target.value, subIndex)
                                                                    }
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-lg">🔹 No sub-questions available</p>
                                                    )}
                                                </>
                                            )}
                                            {questionType === "SQ" && (
                                                <>
                                                    <p className="text-xl font-semibold text-gray-900 mb-4">
                                                        {q.question || "No question provided"} <span className="text-blue-600">(Marks: 1)</span>
                                                    </p>
                                                    <textarea
                                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800 resize-y"
                                                        rows="3"
                                                        placeholder="Write your answer here..."
                                                        value={answers[q._id] || ""}
                                                        onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                    />
                                                </>
                                            )}
                                            {questionType === "unknown" && (
                                                <p className="text-red-600 text-lg">❌ Unknown question type: {q.type}</p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-red-600 text-2xl">❌ No questions found.</p>
                            )}
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 mt-10 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-bold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={timeLeft <= 0}
                        >
                            ✅ Submit Exam
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Footer />
        </div>
    );
}