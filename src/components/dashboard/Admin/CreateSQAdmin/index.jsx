"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateSQAdmin() {
    const [type, setType] = useState("জ্ঞানেরমূলক");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [classLevel, setClassLevel] = useState("");
    const [division, setDivision] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [subjectPart, setSubjectPart] = useState("");
    const [chapterName, setChapterName] = useState("");

    const questionTypes = ["জ্ঞানেরমূলক", "অনুধাবনমূলক", "প্রয়োগমূলক", "সৃষ্টিশীল"];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const sqData = { type, question, answer, classLevel, division, subjectName, subjectPart, chapterName };

        const response = await fetch("/api/sq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sqData),
        });

        if (response.ok) {
            toast.success("✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            setType("জ্ঞানেরমূলক");
            setQuestion("");
            setAnswer("");
            setClassLevel("");
            setDivision("");
            setSubjectName("");
            setSubjectPart("");
            setChapterName("");
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
                <label className="block text-gray-700 font-medium mb-1">ক্লাস নির্বাচন করুন</label>
                <select 
                    className="w-full p-2 border rounded mb-4" 
                    value={classLevel} 
                    onChange={(e) => setClassLevel(e.target.value)} 
                    required
                >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {[...Array(9)].map((_, i) => (
                        <option key={i + 4} value={i + 4}>ক্লাস {i + 4}</option>
                    ))}
                </select>

                {classLevel >= 9 && (
                    <>
                        <label className="block text-gray-700 font-medium mb-1">ডিভিশন নির্বাচন করুন</label>
                        <select 
                            className="w-full p-2 border rounded mb-4" 
                            value={division} 
                            onChange={(e) => setDivision(e.target.value)}
                            required
                        >
                            <option value="">ডিভিশন নির্বাচন করুন</option>
                            {classLevel <= 10 ? (
                                <option value="SSC">SSC</option>
                            ) : (
                                <option value="HSC">HSC</option>
                            )}
                        </select>
                    </>
                )}

                <label className="block text-gray-700 font-medium mb-1">বিষয়ের নাম</label>
                <input 
                    type="text" 
                    placeholder="বিষয়ের নাম" 
                    className="w-full p-2 border rounded mb-4" 
                    value={subjectName} 
                    onChange={(e) => setSubjectName(e.target.value)} 
                    required
                />

                <label className="block text-gray-700 font-medium mb-1">বিষয়ের অংশ (যদি থাকে)</label>
                <input 
                    type="text" 
                    placeholder="বিষয়ের অংশ" 
                    className="w-full p-2 border rounded mb-4" 
                    value={subjectPart} 
                    onChange={(e) => setSubjectPart(e.target.value)} 
                />

                <label className="block text-gray-700 font-medium mb-1">অধ্যায়ের নাম</label>
                <input 
                    type="text" 
                    placeholder="অধ্যায়ের নাম" 
                    className="w-full p-2 border rounded mb-4" 
                    value={chapterName} 
                    onChange={(e) => setChapterName(e.target.value)} 
                    required
                />

                <label className="block text-gray-700 font-medium mb-1">প্রশ্নের ধরন</label>
                <select 
                    className="w-full p-2 border rounded mb-4" 
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
                    className="w-full p-2 border rounded mb-4" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    required
                />

                <label className="block text-gray-700 font-medium mb-1">উত্তর</label>
                <textarea 
                    placeholder="🔹 উত্তর লিখুন" 
                    className="w-full p-2 border rounded mb-4 h-24" 
                    value={answer} 
                    onChange={(e) => setAnswer(e.target.value)} 
                    required
                />

                <motion.button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition"
                    whileTap={{ scale: 0.95 }}
                >
                    ✅ সাবমিট করুন
                </motion.button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}