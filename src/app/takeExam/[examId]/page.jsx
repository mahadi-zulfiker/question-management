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

    useEffect(() => {
        async function fetchExam() {
            try {
                const response = await fetch(`/api/takeExam?examId=${examId}`);
                const data = await response.json();
                console.log("Fetched Exam Data:", data);

                if (response.ok && data.exam) {
                    setExam(data.exam);
                    setTimeLeft(Number(data.exam.duration) * 60); // Convert duration to number
                } else {
                    toast.error("❌ পরীক্ষা লোড করতে সমস্যা হয়েছে!");
                }
            } catch (error) {
                console.error("❌ Fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        if (examId) fetchExam();
    }, [examId]);

    useEffect(() => {
        if (timeLeft <= 0 && exam) {
            handleSubmit();
            return;
        }
        const timer = exam ? setInterval(() => setTimeLeft((prev) => prev - 1), 1000) : null;
        return () => clearInterval(timer);
    }, [timeLeft, exam]);

    const handleSelectAnswer = (questionId, selectedIndex) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
    };

    const handleSubmit = async () => {
        if (!exam || !session?.user?.email) return;

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

            if (response.ok) {
                toast.success("✅ পরীক্ষা সফলভাবে জমা হয়েছে!");
                router.push(`/takeExam/${examId}/submitted`);
            } else {
                toast.error("❌ কিছু সমস্যা হয়েছে!");
            }
        } catch (error) {
            console.error("❌ Submit error:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto my-16 py-16 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                {loading ? (
                    <p>🔄 পরীক্ষা লোড হচ্ছে...</p>
                ) : exam ? (
                    <div>
                        <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                        <p className="text-red-500 font-bold">⏳ সময় বাকি: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
                        {exam.questions.map((q) => (
                            <div key={q._id} className="mb-4 border p-2 rounded">
                                <p className="font-bold">{q.question}</p>
                                <ul>
                                    {q.options.map((opt, index) => (
                                        <li key={index}>
                                            <label>
                                                <input
                                                    type="radio"
                                                    name={q._id}
                                                    value={index}
                                                    checked={answers[q._id] === index}
                                                    onChange={() => handleSelectAnswer(q._id, index)}
                                                />
                                                {opt}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition font-bold"
                        >
                            ✅ পরীক্ষা জমা দিন
                        </button>
                    </div>
                ) : (
                    <p className="text-red-500 font-bold">❌ পরীক্ষা খুঁজে পাওয়া যায়নি!</p>
                )}
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            </div>
            <Footer />
        </div>
    );
}
