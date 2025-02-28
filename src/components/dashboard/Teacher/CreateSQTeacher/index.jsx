"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateSQTeacher() {
    const [type, setType] = useState("গবেষণামূলক");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const questionTypes = ["জ্ঞানেরমূলক", "অনুধাবনমূলক", "প্রয়োগমূলক", "সৃষ্টিশীল"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sqData = { type, question, answer };

        const response = await fetch("/api/sq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sqData),
        });

        if (response.ok) {
            toast.success("✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            setType("গবেষণামূলক");
            setQuestion("");
            setAnswer("");
        } else {
            toast.error("❌ কিছু সমস্যা হয়েছে! আবার চেষ্টা করুন।", { position: "top-right" });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-6"
        >
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন</h2>
            <form onSubmit={handleSubmit}>
                <label className="block text-gray-700 font-medium mb-1">প্রশ্নের ধরন</label>
                <select 
                    className="w-full p-2 border rounded mb-4 focus:border-blue-500 focus:outline-none"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    {questionTypes.map((qType) => (
                        <option key={qType} value={qType}>{qType}</option>
                    ))}
                </select>

                <label className="block text-gray-700 font-medium mb-1">প্রশ্ন</label>
                <input 
                    type="text" 
                    placeholder="🔹 প্রশ্ন লিখুন" 
                    className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    required
                />

                <label className="block text-gray-700 font-medium mt-4">উত্তর</label>
                <textarea 
                    placeholder="🔹 উত্তর লিখুন" 
                    className="w-full p-2 border rounded mt-2 h-24 focus:border-blue-500 focus:outline-none" 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)} 
                    required
                />

                <motion.button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition font-bold"
                    whileTap={{ scale: 0.95 }}
                >
                    ✅ সাবমিট করুন
                </motion.button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}
