"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExamSubmitted() {
    const router = useRouter();

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 flex items-center justify-center">
                <div className="max-w-3xl mx-auto py-16 px-6 text-center bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-12 border border-blue-100">
                    <div className="inline-block p-4 bg-blue-100 rounded-full mb-6">
                        <span className="text-5xl text-blue-600">✅</span>
                    </div>
                    <h2 className="text-5xl font-extrabold mb-6 text-indigo-900 drop-shadow-md">Exam Successfully Submitted!</h2>
                    <p className="text-xl text-gray-700 mb-10">Thank you! Please wait for your results.</p>
                    <button
                        onClick={() => router.push("/takeExam")}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg font-semibold"
                    >
                        🔙 Back to Exam List
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}