"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateCQAdmin() {
    const [passage, setPassage] = useState("");
    const [questions, setQuestions] = useState(["", "", "", ""]);
    const [answers, setAnswers] = useState(["", "", "", ""]);
    const marks = [1, 2, 3, 4]; // Assigned marks

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cqData = { passage, questions, answers, marks };
        
        const response = await fetch("/api/cq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cqData),
        });

        if (response.ok) {
            toast.success("✅ সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            setPassage("");
            setQuestions(["", "", "", ""]);
            setAnswers(["", "", "", ""]);
        } else {
            toast.error("❌ কিছু সমস্যা হয়েছে! আবার চেষ্টা করুন।", { position: "top-right" });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-6"
        >
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📝 সৃজনশীল প্রশ্ন তৈরি করুন</h2>
            <form onSubmit={handleSubmit}>
                <textarea 
                    placeholder="🔹 অনুচ্ছেদ লিখুন" 
                    className="w-full p-3 border rounded mb-4 h-24 focus:border-blue-500 focus:outline-none" 
                    value={passage} 
                    onChange={(e) => setPassage(e.target.value)}
                    required
                />
                {questions.map((question, i) => (
                    <div key={i} className="mb-4 bg-gray-100 p-3 rounded-lg shadow-md">
                        <label className="block text-gray-700 font-medium mb-1">
                            {`প্রশ্ন ${i + 1} (নম্বর: ${marks[i]})`}
                        </label>
                        <input 
                            type="text" 
                            placeholder={`🔹 প্রশ্ন ${i + 1}`} 
                            className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none" 
                            value={question} 
                            onChange={(e) => handleQuestionChange(i, e.target.value)} 
                            required
                        />
                        <label className="block text-gray-700 font-medium mt-2">উত্তর</label>
                        <textarea 
                            placeholder={`🔹 উত্তর ${i + 1}`} 
                            className="w-full p-2 border rounded mt-2 h-20 focus:border-blue-500 focus:outline-none" 
                            value={answers[i]} 
                            onChange={(e) => handleAnswerChange(i, e.target.value)} 
                            required
                        />
                    </div>
                ))}
                <motion.button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600 transition font-bold"
                    whileTap={{ scale: 0.95 }}
                >
                    ✅ সাবমিট করুন
                </motion.button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}
