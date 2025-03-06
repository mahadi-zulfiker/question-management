"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateCQAdmin() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [selectedChapterName, setSelectedChapterName] = useState("");
    const [subjectParts, setSubjectParts] = useState([]);
    const [selectedSubjectPart, setSelectedSubjectPart] = useState("");

    const [passage, setPassage] = useState("");
    const [questions, setQuestions] = useState(["", "", "", ""]);
    const [answers, setAnswers] = useState(["", "", "", ""]);

    const marks = [1, 2, 3, 4];

    useEffect(() => {
        async function fetchClasses() {
            const res = await fetch("/api/cq");
            const data = await res.json();
            setClasses(data);
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) return;
            const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
            const data = await res.json();

            if (data.length > 0) {
                setSubjects([...new Set(data.map((item) => item.subject))]);
                setSubjectParts([...new Set(data.map((item) => item.subjectPart))]);
                setChapters([...new Set(data.map((item) => ({ number: item.chapterNumber, name: item.chapterName })))])
            }
        }
        fetchClassData();
    }, [selectedClass]);

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

    const resetForm = () => {
        setSelectedClass("");
        setSubjects([]);
        setSelectedSubject("");
        setChapters([]);
        setSelectedChapter("");
        setSelectedChapterName("");
        setSubjectParts([]);
        setSelectedSubjectPart("");
        setPassage("");
        setQuestions(["", "", "", ""]);
        setAnswers(["", "", "", ""]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const cqData = {
            passage,
            questions,
            answers,
            marks,
            classNumber: selectedClass,
            division: null, // Add division if needed
            subject: selectedSubject,
            subjectPart: selectedSubjectPart,
            chapterNumber: selectedChapter,
            chapterName: selectedChapterName,
            teacherEmail: "teacher@example.com", // Ensure teacherEmail is present
        };
    
        console.log("📦 Sending CQ Data:", cqData); // Debugging the payload
    
        const response = await fetch("/api/cq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cqData),
        });
    
        if (response.ok) {
            toast.success("✅ সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            resetForm();
        } else {
            const error = await response.json();
            console.error("❌ Submission Error:", error);
            toast.error(`❌ কিছু সমস্যা হয়েছে! ${error.error}`, { position: "top-right" });
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
                <select
                    className="w-full p-2 border rounded mb-3"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(Number(e.target.value))}
                    required
                >
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.map((cls) => (
                        <option key={cls.classNumber} value={cls.classNumber}>
                            ক্লাস {cls.classNumber}
                        </option>
                    ))}
                </select>


                {selectedClass && subjects.length > 0 && (
                    <select className="w-full p-2 border rounded mb-3" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required>
                        <option value="">বিষয় নির্বাচন করুন</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                )}

                {selectedSubject && subjectParts.length > 0 && (
                    <select className="w-full p-2 border rounded mb-3" value={selectedSubjectPart} onChange={(e) => setSelectedSubjectPart(e.target.value)}>
                        <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                        {subjectParts.map((part) => (
                            <option key={part} value={part}>{part}</option>
                        ))}
                    </select>
                )}

                {selectedSubject && chapters.length > 0 && (
                    <select className="w-full p-2 border rounded mb-3" value={selectedChapter} onChange={(e) => {
                        const selected = chapters.find(chap => chap.number === parseInt(e.target.value));
                        setSelectedChapter(e.target.value);
                        setSelectedChapterName(selected?.name || "");
                    }} required>
                        <option value="">অধ্যায় নির্বাচন করুন</option>
                        {chapters.map((chapter) => (
                            <option key={chapter.number} value={chapter.number}>{chapter.name}</option>
                        ))}
                    </select>
                )}

                <textarea placeholder="🔹 অনুচ্ছেদ লিখুন" className="w-full p-3 border rounded mb-4 h-24" value={passage} onChange={(e) => setPassage(e.target.value)} required />

                {questions.map((question, i) => (
                    <div key={i} className="mb-4">
                        <input type="text" placeholder={`🔹 প্রশ্ন ${i + 1}`} className="w-full p-2 border rounded" value={question} onChange={(e) => handleQuestionChange(i, e.target.value)} required />
                        <textarea placeholder={`🔹 উত্তর ${i + 1}`} className="w-full p-2 border rounded mt-2" value={answers[i]} onChange={(e) => handleAnswerChange(i, e.target.value)} required />
                    </div>
                ))}

                <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600">✅ সাবমিট করুন</button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}