"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ExamSubmitted() {
    const router = useRouter();

    return (
        <div>
            <Navbar />
            <div className="max-w-3xl mx-auto my-16 py-16 p-6 bg-white rounded-lg shadow-lg text-center border border-gray-200">
                <h2 className="text-2xl font-bold text-green-600">✅ পরীক্ষা জমা দেওয়া হয়েছে!</h2>
                <p className="mt-4 text-gray-600">আপনার ফলাফলের জন্য অপেক্ষা করুন।</p>
                <button 
                    onClick={() => router.push("/takeExam")} 
                    className="mt-6 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                    🔙 পরীক্ষার তালিকায় ফিরে যান
                </button>
            </div>
            <Footer />
        </div>
    );
}