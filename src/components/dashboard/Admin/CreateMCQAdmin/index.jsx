"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function CreateMCQAdmin() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [selectedChapterName, setSelectedChapterName] = useState("");
    const [subjectParts, setSubjectParts] = useState([]);
    const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
    const [questionType, setQuestionType] = useState("general"); // NEW STATE

    const [question, setQuestion] = useState("");
    const [numOptions, setNumOptions] = useState(4);
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [higherOptions, setHigherOptions] = useState(["", "", "", ""]); // NEW STATE
    const [higherCorrectAnswer, setHigherCorrectAnswer] = useState(null); // NEW STATE

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

    const handleOptionChange = (index, value, type = "general") => {
        if (type === "general") {
            const newOptions = [...options];
            newOptions[index] = value;
            setOptions(newOptions);
        } else {
            const newHigherOptions = [...higherOptions];
            newHigherOptions[index] = value;
            setHigherOptions(newHigherOptions);
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
                    question: row.Question || "",
                    classNumber: row.Class || selectedClass,
                    subject: row.Subject || selectedSubject,
                    chapterNumber: row["Chapter Number"] || selectedChapter,
                    chapterName: row["Chapter Name"] || selectedChapterName,
                    questionType: row["MCQ Type"], // Determines whether it's generalCQ or mathCQ

                    // Handling different MCQ types
                    options: row["MCQ Type"] === "general"
                        ? [
                            row["Option 1"] || "",
                            row["Option 2"] || "",
                            row["Option 3"] || "",
                            row["Option 4"] || ""
                        ]
                        : [
                            row["Option 1"] || "",
                            row["Option 2"] || "",
                            row["Option 3"] || "",
                            row["Option 4"] || "",
                            row["Option 5"] || "",
                            row["Option 6"] || "",
                            row["Option 7"] || ""
                        ],
                }));

                // Send data to API
                const response = await fetch("/api/mcq/import", {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questionType === "general" && correctAnswer === null) {
            toast.error("দয়া করে সঠিক উত্তর নির্বাচন করুন!", { position: "top-right" });
            return;
        }
        if (questionType === "higher" && higherCorrectAnswer === null) {
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
            options: questionType === "general" ? options : higherOptions,
            correctAnswer: questionType === "general" ? correctAnswer : higherCorrectAnswer,
            questionType, // NEW FIELD
            teacherEmail: "admin",
            questionType: questionType
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
            setHigherOptions(["", "", "", ""]);
            setCorrectAnswer(null);
            setHigherCorrectAnswer(null);
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
                <p>অথবা</p>
                <hr />
                <br />
                <select
                    className="w-full p-2 border rounded mb-3"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    required
                >
                    <option value="general">সাধারণ এমসিকিউ</option>
                    <option value="higher">উচ্চতর দক্ষতা এমসিকিউ</option>
                </select>

                <select
                    className="w-full p-2 border rounded mb-3"
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
                        className="w-full p-2 border rounded mb-3"
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
                        className="w-full p-2 border rounded mb-3"
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
                        className="w-full p-2 border rounded mb-3"
                        value={selectedChapter}
                        onChange={(e) => {
                            const selected = chapters.find(
                                (chap) => chap.number === parseInt(e.target.value)
                            );
                            setSelectedChapter(e.target.value);
                            setSelectedChapterName(selected?.name || "");
                        }}
                        required
                    >
                        <option value="">অধ্যায় নির্বাচন করুন</option>
                        {chapters.map((chapter) => (
                            <option key={chapter.number} value={chapter.number}>
                                {chapter.name}
                            </option>
                        ))}
                    </select>
                )}

                <input
                    type="text"
                    placeholder="প্রশ্ন লিখুন"
                    className="w-full p-2 border rounded mb-3"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                />

                {questionType === "general" &&
                    options.map((option, i) => (
                        <div key={i} className="flex items-center mb-2">
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
                        </div>
                    ))}

                {questionType === "higher" && (
                    <>
                        {higherOptions.slice(0, 3).map((option, i) => (
                            <div key={i} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    placeholder={`বিকল্প ${i + 1}`}
                                    className="flex-1 p-2 border rounded"
                                    value={option || ""}
                                    onChange={(e) => handleOptionChange(i, e.target.value, "higher")}
                                    required
                                />
                            </div>
                        ))}

                        <h3 className="mt-4 mb-2 text-lg font-bold text-gray-700">নিচের কোনটি সঠিক?</h3>
                        {/* Ensure all 4 options appear */}
                        {[...Array(4)].map((_, i) => (
                            <div key={i + 3} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    placeholder={`অপশন ${i + 1}`}
                                    className="flex-1 p-2 border rounded"
                                    value={higherOptions[i + 3] || ""}
                                    onChange={(e) => handleOptionChange(i + 3, e.target.value, "higher")}
                                    required
                                />
                                <input
                                    type="radio"
                                    name="higherCorrect"
                                    className="ml-2"
                                    onChange={() => setHigherCorrectAnswer(i + 3)}
                                    checked={higherCorrectAnswer === i + 3}
                                    required
                                />
                            </div>
                        ))}
                    </>
                )}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600 transition"
                >
                    ✅ সাবমিট করুন
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </motion.div>
    );
}
