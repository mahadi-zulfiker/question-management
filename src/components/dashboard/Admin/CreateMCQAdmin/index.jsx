"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateMCQAdmin() {
    const [question, setQuestion] = useState("");
    const [numOptions, setNumOptions] = useState(4);
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    useEffect(() => {
        setOptions((prev) => [...prev.slice(0, numOptions), ...Array(Math.max(0, numOptions - prev.length)).fill("")]);
    }, [numOptions]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (correctAnswer === null) {
            toast.error("দয়া করে সঠিক উত্তর নির্বাচন করুন!", { position: "top-right" });
            return;
        }
        const mcqData = { question, options, correctAnswer };
        const response = await fetch("/api/mcq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mcqData),
        });
        if (response.ok) {
            toast.success("✅ এমসিকিউ সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            setQuestion("");
            setOptions(["", "", "", ""]);
            setCorrectAnswer(null);
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
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📝 এমসিকিউ তৈরি করুন</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="প্রশ্ন লিখুন" 
                    className="w-full p-2 border rounded mb-3" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    required 
                />
                <motion.input 
                    type="number" 
                    min="2" max="6" 
                    className="w-full p-2 border rounded mb-3" 
                    value={numOptions} 
                    onChange={(e) => setNumOptions(Number(e.target.value))} 
                    whileFocus={{ scale: 1.05 }}
                />
                {options.map((option, i) => (
                    <motion.div key={i} className="flex items-center mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <input 
                            type="text" 
                            placeholder={`বিকল্প ${i + 1}`} 
                            className="flex-1 p-2 border rounded" 
                            value={option || ""} 
                            onChange={(e) => handleOptionChange(i, e.target.value)} 
                            required 
                        />
                        <input 
                            type="radio" 
                            name="correct" 
                            className="ml-2" 
                            onChange={() => setCorrectAnswer(i)} 
                            checked={correctAnswer === i}
                            required 
                        />
                    </motion.div>
                ))}
                <motion.button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600 transition"
                    whileTap={{ scale: 0.95 }}
                >
                    ✅ সাবমিট করুন
                </motion.button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}
