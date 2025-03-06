"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";

export default function CreateMCQTeacher() {
    const { data: session } = useSession();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [selectedChapterName, setSelectedChapterName] = useState("");
    const [subjectParts, setSubjectParts] = useState([]);
    const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
    
    const [question, setQuestion] = useState("");
    const [numOptions, setNumOptions] = useState(4);
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(null);

    useEffect(() => {
        async function fetchClasses() {
            const res = await fetch("/api/mcq");
            const data = await res.json();
            setClasses(data);
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) return;
            const res = await fetch(`/api/mcq?classNumber=${selectedClass}`);
            const data = await res.json();
            
            if (data.length > 0) {
                setSubjects([...new Set(data.map((item) => item.subject))]);
                setSubjectParts([...new Set(data.map((item) => item.subjectPart))]);
                setChapters([...new Set(data.map((item) => ({ number: item.chapterNumber, name: item.chapterName })))]);
            }
        }
        fetchClassData();
    }, [selectedClass]);

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
        const mcqData = { 
            classNumber: selectedClass, 
            subject: selectedSubject, 
            subjectPart: selectedSubjectPart, 
            chapterNumber: selectedChapter, 
            chapterName: selectedChapterName,
            question, 
            options, 
            correctAnswer, 
            teacherEmail: session?.user?.email || "admin" 
        };

        const response = await fetch("/api/mcq", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mcqData),
        });

        if (response.ok) {
            toast.success("✅ এমসিকিউ সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            setSelectedClass("");
            setSelectedSubject("");
            setSelectedChapter("");
            setSelectedChapterName("");
            setSelectedSubjectPart("");
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
                <select className="w-full p-2 border rounded mb-3" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
                    <option value="">ক্লাস নির্বাচন করুন</option>
                    {classes.map((cls) => (
                        <option key={cls.classNumber} value={cls.classNumber}>ক্লাস {cls.classNumber}</option>
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

                <input type="text" placeholder="প্রশ্ন লিখুন" className="w-full p-2 border rounded mb-3" value={question} onChange={(e) => setQuestion(e.target.value)} required />
                {options.map((option, i) => (
                    <div key={i} className="flex items-center mb-2">
                        <input type="text" placeholder={`বিকল্প ${i + 1}`} className="flex-1 p-2 border rounded" value={option || ""} onChange={(e) => handleOptionChange(i, e.target.value)} required />
                        <input type="radio" name="correct" className="ml-2" onChange={() => setCorrectAnswer(i)} checked={correctAnswer === i} required />
                    </div>
                ))}

                <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600 transition">✅ সাবমিট করুন</button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}
