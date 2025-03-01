// ExamList.js
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

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await fetch("/api/takeExam");
                const data = await response.json();
                if (response.ok && data.exams) {
                    setExams(data.exams);
                } else {
                    throw new Error("Exam fetch failed");
                }
            } catch (error) {
                toast.error("❌ পরীক্ষা লোড করতে সমস্যা হয়েছে!");
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto my-16 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📋 পরীক্ষার তালিকা</h2>
                {loading ? (
                    <p>🔄 পরীক্ষা লোড হচ্ছে...</p>
                ) : exams.length > 0 ? (
                    exams.map((exam) => (
                        <div key={exam._id} className="mb-4 border p-4 rounded bg-gray-100">
                            <p className="font-bold text-lg">{exam.title}</p>
                            <p className="text-gray-700">🕒 সময়কাল: {exam.duration} মিনিট</p>
                            <button
                                onClick={() => router.push(`/takeExam/${exam._id}`)}
                                className="bg-green-500 text-white py-1 px-3 mt-2 rounded hover:bg-green-600 transition"
                            >
                                🏁 পরীক্ষা শুরু করুন
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-red-500 font-bold">❌ কোনো পরীক্ষা পাওয়া যায়নি।</p>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Footer />
        </div>
    );
}
