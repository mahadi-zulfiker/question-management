"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function CreateSQAdmin() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [subjectParts, setSubjectParts] = useState([]);
    const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
    const [chapters, setChapters] = useState([]);
    const [selectedChapterNumber, setSelectedChapterNumber] = useState("");
    const [selectedChapterName, setSelectedChapterName] = useState("");
    const [type, setType] = useState("জ্ঞানেরমূলক");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/sq");
                const data = await res.json();
                console.log("Initial Classes Data:", data);
                setClasses(data);
            } catch (error) {
                console.error("Error fetching classes:", error);
                toast.error("❌ ক্লাস লোড করতে সমস্যা হয়েছে!");
            }
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) {
                setSubjects([]);
                setSubjectParts([]);
                setChapters([]);
                setSelectedSubject("");
                setSelectedSubjectPart("");
                setSelectedChapterNumber("");
                setSelectedChapterName("");
                return;
            }

            try {
                const res = await fetch(`/api/sq?classNumber=${selectedClass}`);
                const data = await res.json();
                console.log("API Response for classNumber", selectedClass, ":", data);

                if (data.length > 0) {
                    const subjects = [...new Set(data.map((item) => item.subject))];
                    const subjectParts = [...new Set(data.map((item) => item.subjectPart).filter(Boolean))];
                    const chapters = [...new Set(data.map((item) => ({ chapterNumber: item.chapterNumber, chapterName: item.chapterName })))];
                    console.log("Subjects:", subjects);
                    console.log("Subject Parts:", subjectParts);
                    console.log("Chapters:", chapters);
                    setSubjects(subjects);
                    setSubjectParts(subjectParts);
                    setChapters(chapters);
                } else {
                    setSubjects([]);
                    setSubjectParts([]);
                    setChapters([]);
                    toast.info("⚠️ এই ক্লাসের জন্য কোনো ডেটা নেই।");
                }
            } catch (error) {
                console.error("Error fetching class data:", error);
                toast.error("❌ ডেটা লোড করতে সমস্যা হয়েছে!");
            }
        }
        fetchClassData();
    }, [selectedClass]);

    const resetForm = () => {
        setSelectedClass("");
        setSubjects([]);
        setSelectedSubject("");
        setSubjectParts([]);
        setSelectedSubjectPart("");
        setChapters([]);
        setSelectedChapterNumber("");
        setSelectedChapterName("");
        setType("জ্ঞানমূলক");
        setQuestion("");
        setAnswer("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const sqData = {
            type,
            question,
            classLevel: parseInt(selectedClass), // Use classLevel for SQ collection
            subjectName: selectedSubject, // Map to subjectName for SQ
            subjectPart: selectedSubjectPart || null,
            chapterNumber: parseInt(selectedChapterNumber),
            chapterName: selectedChapterName,
            teacherEmail: "admin",
        };
        console.log("📦 Sending SQ Data:", sqData);

        try {
            const response = await fetch("/api/sq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sqData),
            });

            if (response.ok) {
                toast.success("সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
                resetForm();
            } else {
                const error = await response.json();
                console.error("❌ Submission Error:", error);
                toast.error(`❌ কিছু সমস্যা হয়েছে! ${error.error || "আবার চেষ্টা করুন।"}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            toast.error("❌ নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।", { position: "top-right" });
        }
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);

            if (data.length > 0) {
                const extractedQuestions = data.map(row => ({
                    classNumber: row.Class || selectedClass,
                    subject: row.Subject || selectedSubject,
                    chapterNumber: row["Chapter Number"] || selectedChapter,
                    chapterName: row["Chapter Name"] || selectedChapterName,
                    question: row.Question
                }));

                // Send data to API
                const response = await fetch("/api/sq/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ questions: extractedQuestions })
                });

                if (response.ok) {
                    toast.success("প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
                } else {
                    toast.error("❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ হয়েছে!");
                }
            } else {
                toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
            }
        };

        reader.readAsBinaryString(file);
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
                <div className="mb-4">
                    <label
                        className="block text-gray-700 mb-2"
                        style={{ fontWeight: "bold" }}
                    >
                        এক্সেল ফাইল থেকে প্রশ্ন আমদানি করুন
                    </label>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <select
                    className="w-full p-2 border rounded mb-4"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
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
                    <select
                        className="w-full p-2 border rounded mb-4"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        required
                    >
                        <option value="">বিষয় নির্বাচন করুন</option>
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                )}

                {selectedSubject && subjectParts.length > 0 && (
                    <select
                        className="w-full p-2 border rounded mb-4"
                        value={selectedSubjectPart}
                        onChange={(e) => setSelectedSubjectPart(e.target.value)}
                    >
                        <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                        {subjectParts.map((part) => (
                            <option key={part} value={part}>
                                {part}
                            </option>
                        ))}
                    </select>
                )}

                {selectedSubject && chapters.length > 0 && (
                    <select
                        className="w-full p-2 border rounded mb-4"
                        value={selectedChapterNumber}
                        onChange={(e) => {
                            const selected = chapters.find((chap) => chap.chapterNumber === parseInt(e.target.value));
                            console.log("Selected Chapter:", selected);
                            setSelectedChapterNumber(e.target.value);
                            setSelectedChapterName(selected?.chapterName || "");
                        }}
                        required
                    >
                        <option value="">অধ্যায় নির্বাচন করুন</option>
                        {chapters.map((chapter) => (
                            <option key={chapter.chapterNumber} value={chapter.chapterNumber}>
                                {chapter.chapterNumber} - {chapter.chapterName}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    className="w-full p-2 border rounded mb-4"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                >
                    <option value="জ্ঞানেরমূলক">জ্ঞানমূলক</option>
                    <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                    <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                    <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                </select>

                <input
                    type="text"
                    placeholder="🔹 প্রশ্ন লিখুন"
                    className="w-full p-2 border rounded mb-4"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                />

                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    ✅ সাবমিট করুন
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}