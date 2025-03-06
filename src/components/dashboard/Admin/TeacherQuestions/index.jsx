"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function TeacherQuestions() {
    const [questions, setQuestions] = useState({ mcqs: [], cqs: [], sqs: [] });
    const [teacherEmails, setTeacherEmails] = useState([]);
    const [selectedTeacherEmail, setSelectedTeacherEmail] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch teacher emails on mount
    useEffect(() => {
        fetchTeacherEmails();
    }, []);

    // Fetch questions when a teacher is selected
    useEffect(() => {
        if (selectedTeacherEmail) {
            fetchQuestions();
        }
    }, [selectedTeacherEmail]);

    const fetchTeacherEmails = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/teacherQuestions");
            setTeacherEmails(response.data.teacherEmails);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching teacher emails:", error);
            toast.error("❌ শিক্ষকের ইমেইল লোড করতে সমস্যা!");
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/teacherQuestions?teacherEmail=${selectedTeacherEmail}`);
            setQuestions(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
            toast.error(`❌ প্রশ্ন লোড করতে সমস্যা! ${error.response?.data?.error || "অজানা ত্রুটি"}`);
            setLoading(false);
        }
    };

    const handleTeacherSelect = (e) => {
        setSelectedTeacherEmail(e.target.value);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                📝 শিক্ষকের প্রশ্ন ড্যাশবোর্ড
            </h1>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {/* Teacher Email Dropdown */}
            <div className="mb-6 flex justify-center">
                <select
                    value={selectedTeacherEmail}
                    onChange={handleTeacherSelect}
                    className="p-3 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white"
                >
                    <option value="">শিক্ষক নির্বাচন করুন</option>
                    {teacherEmails.map((email) => (
                        <option key={email} value={email}>
                            {email}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : !selectedTeacherEmail ? (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 text-lg"
                >
                    প্রশ্ন দেখতে একজন শিক্ষক নির্বাচন করুন।
                </motion.p>
            ) : (
                <div className="space-y-12">
                    {/* MCQs Section */}
                    <Section title="মাল্টিপল চয়েস প্রশ্ন (MCQ)" questions={questions.mcqs} renderItem={renderMCQ} />

                    {/* CQs Section */}
                    <Section title="সৃজনশীল প্রশ্ন (CQ)" questions={questions.cqs} renderItem={renderCQ} />

                    {/* SQs Section */}
                    <Section title="সংক্ষিপ্ত প্রশ্ন (SQ)" questions={questions.sqs} renderItem={renderSQ} />
                </div>
            )}
        </div>
    );
}

// Section Component
const Section = ({ title, questions, renderItem }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
    >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        {questions.length === 0 ? (
            <p className="text-gray-500 italic">কোনো প্রশ্ন পাওয়া যায়নি।</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((question, index) => (
                    <motion.div
                        key={question._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                    >
                        {renderItem(question)}
                    </motion.div>
                ))}
            </div>
        )}
    </motion.div>
);

// Render Functions for Each Question Type
const renderMCQ = (q) => (
    <>
        <p className="font-semibold text-gray-800 mb-2">{q.question}</p>
        <ul className="list-disc pl-5 text-gray-700 mb-2">
            {q.options.map((option, i) => (
                <li key={i} className={q.correctAnswer === i ? "text-green-600 font-medium" : ""}>
                    {option}
                </li>
            ))}
        </ul>
        <p className="text-sm text-gray-500">ক্লাস: {q.classNumber} | বিষয়: {q.subject} | অধ্যায়: {q.chapterName}</p>
    </>
);

const renderCQ = (q) => (
    <>
        <p className="font-semibold text-gray-800 mb-2">{q.passage}</p>
        <ul className="list-decimal pl-5 text-gray-700 mb-2">
            {q.questions.map((question, i) => (
                <li key={i}>
                    {question} <span className="text-gray-500">({q.marks[i]} নম্বর)</span>
                    <p className="text-gray-600 mt-1">উত্তর: {q.answers[i]}</p>
                </li>
            ))}
        </ul>
        <p className="text-sm text-gray-500">ক্লাস: {q.classNumber} | বিষয়: {q.subject} | অধ্যায়: {q.chapterName}</p>
    </>
);

const renderSQ = (q) => (
    <>
        <p className="font-semibold text-gray-800 mb-2">{q.question}</p>
        <p className="text-gray-700 mb-2">উত্তর: {q.answer}</p>
        <p className="text-sm text-gray-500">ক্লাস: {q.classLevel} | বিষয়: {q.subjectName} | অধ্যায়: {q.chapterName} | প্রকার: {q.type}</p>
    </>
);