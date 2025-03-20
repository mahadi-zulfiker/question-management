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
    const [isMultipleSQs, setIsMultipleSQs] = useState(false);

    const [sqs, setSQs] = useState([{
        type: "জ্ঞানমূলক",
        question: "",
        answer: "", // Optional answer field
        image: null,
        imageAlignment: "center", // Added image alignment
    }]);

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

    const addNewSQ = () => {
        setSQs([...sqs, {
            type: "জ্ঞানমূলক",
            question: "",
            answer: "",
            image: null,
            imageAlignment: "center",
        }]);
    };

    const handleTypeChange = (index, value) => {
        const newSQs = [...sqs];
        newSQs[index].type = value;
        setSQs(newSQs);
    };

    const handleQuestionChange = (index, value) => {
        const newSQs = [...sqs];
        newSQs[index].question = value;
        setSQs(newSQs);
    };

    const handleAnswerChange = (index, value) => {
        const newSQs = [...sqs];
        newSQs[index].answer = value;
        setSQs(newSQs);
    };

    const handleImageChange = (index, e) => {
        const newSQs = [...sqs];
        newSQs[index].image = e.target.files[0];
        setSQs(newSQs);
    };

    const handleImageAlignmentChange = (index, value) => {
        const newSQs = [...sqs];
        newSQs[index].imageAlignment = value;
        setSQs(newSQs);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const binaryStr = event.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                if (data.length > 0) {
                    const extractedQuestions = data.map(row => ({
                        type: row.Type || "জ্ঞানমূলক",
                        question: row.Question || "",
                        answer: row.Answer || "",
                        classLevel: row.Class || selectedClass,
                        subjectName: row.Subject || selectedSubject,
                        subjectPart: row["Subject Part"] || selectedSubjectPart,
                        chapterNumber: row["Chapter Number"] || selectedChapterNumber,
                        chapterName: row["Chapter Name"] || selectedChapterName,
                        imageAlignment: row["Image Alignment"] || "center", // Support for Excel
                    }));

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
            } catch (error) {
                toast.error("❌ ফাইল প্রসেসিংয়ে ত্রুটি!");
            }
        };
        reader.readAsBinaryString(file);
    };

    const resetForm = () => {
        setSelectedClass("");
        setSubjects([]);
        setSelectedSubject("");
        setSubjectParts([]);
        setSelectedSubjectPart("");
        setChapters([]);
        setSelectedChapterNumber("");
        setSelectedChapterName("");
        setSQs([{ type: "জ্ঞানমূলক", question: "", answer: "", image: null, imageAlignment: "center" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("classLevel", selectedClass);
        formData.append("subjectName", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart || "");
        formData.append("chapterNumber", selectedChapterNumber);
        formData.append("chapterName", selectedChapterName);
        formData.append("teacherEmail", "admin");

        sqs.forEach((sq, index) => {
            formData.append(`sqs[${index}][type]`, sq.type);
            formData.append(`sqs[${index}][question]`, sq.question);
            formData.append(`sqs[${index}][answer]`, sq.answer || "");
            if (sq.image) {
                formData.append(`sqs[${index}][image]`, sq.image);
            }
            formData.append(`sqs[${index}][imageAlignment]`, sq.imageAlignment);
        });

        try {
            const response = await fetch("/api/sq/import", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            if (response.ok) {
                toast.success(`✅ ${sqs.length}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!`, { position: "top-right" });
                resetForm();
            } else {
                toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!", { position: "top-right" });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-bold">এক্সেল ফাইল থেকে প্রশ্ন আমদানি করুন</label>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <p className="text-center">অথবা</p>
                        <hr className="mb-4" />

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
                                    <option key={subject} value={subject}>{subject}</option>
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
                                    <option key={part} value={part}>{part}</option>
                                ))}
                            </select>
                        )}

                        {selectedSubject && chapters.length > 0 && (
                            <select
                                className="w-full p-2 border rounded mb-4"
                                value={selectedChapterNumber}
                                onChange={(e) => {
                                    const selected = chapters.find((chap) => chap.chapterNumber === parseInt(e.target.value));
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

                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                checked={isMultipleSQs}
                                onChange={(e) => setIsMultipleSQs(e.target.checked)}
                                className="mr-2"
                            />
                            <label>একাধিক সংক্ষিপ্ত প্রশ্ন যোগ করুন</label>
                        </div>

                        {sqs.map((sq, index) => (
                            <div key={index} className="mb-6 p-4 border rounded bg-gray-50">
                                <h3 className="text-lg font-semibold mb-2">সংক্ষিপ্ত প্রশ্ন {index + 1}</h3>
                                <select
                                    className="w-full p-2 border rounded mb-4"
                                    value={sq.type}
                                    onChange={(e) => handleTypeChange(index, e.target.value)}
                                    required
                                >
                                    <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                                    <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                                    <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                                    <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="🔹 প্রশ্ন লিখুন"
                                    className="w-full p-2 border rounded mb-4"
                                    value={sq.question}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    required
                                />

                                <textarea
                                    placeholder="🔹 উত্তর লিখুন (ঐচ্ছিক)"
                                    className="w-full p-2 border rounded mb-4 h-24"
                                    value={sq.answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />

                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-bold">প্রশ্নের সাথে ছবি যুক্ত করুন (ঐচ্ছিক)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(index, e)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>

                                {sq.image && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2 font-bold">ছবির অ্যালাইনমেন্ট</label>
                                        <select
                                            value={sq.imageAlignment}
                                            onChange={(e) => handleImageAlignmentChange(index, e.target.value)}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="left">বামে</option>
                                            <option value="center">মাঝে</option>
                                            <option value="right">ডানে</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isMultipleSQs && (
                            <button
                                type="button"
                                onClick={addNewSQ}
                                className="w-full bg-green-500 text-white py-2 mt-3 rounded hover:bg-green-600 transition flex items-center justify-center"
                            >
                                <span className="text-xl mr-2">+</span> নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন
                            </button>
                        )}

                        <button type="submit" className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600">
                            ✅ সাবমিট করুন
                        </button>
                    </form>
                </motion.div>

                {/* Preview Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-6"
                >
                    <h2 className="text-xl font-bold mb-4 text-blue-600">প্রিভিউ</h2>
                    {sqs.map((sq, index) => (
                        <div key={index} className="mb-6">
                            <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2">SQ</p>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                                {sq.type ? `${sq.type}: ` : ""}{sq.question || "প্রশ্ন লিখুন"}
                            </p>
                            {sq.image && (
                                <div className={`mb-4 ${sq.imageAlignment === "left" ? "text-left" : sq.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                    <img
                                        src={URL.createObjectURL(sq.image)}
                                        alt={`SQ preview ${index + 1}`}
                                        className="rounded shadow-md max-h-48 inline-block"
                                    />
                                </div>
                            )}
                            {sq.answer && (
                                <p className="text-gray-700 mb-4"><span className="font-semibold">উত্তর:</span> {sq.answer}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                                Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter: {selectedChapterName || "N/A"}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}