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
        answer: "",
        image: null,
        imageAlignment: "center",
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
                        imageAlignment: row["Image Alignment"] || "center",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold text-center text-blue-700 mb-8"
            >
                📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">এক্সেল ফাইল থেকে আমদানি</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <p className="text-center text-gray-500">এক্সেল ফাইল টেনে আনুন বা ক্লিক করুন</p>
                            </div>
                        </div>
                        <p className="text-center text-gray-500 mb-4">অথবা</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">ক্লাস</label>
                                <select
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                            </div>

                            {selectedClass && subjects.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">বিষয়</label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        required
                                    >
                                        <option value="">বিষয় নির্বাচন করুন</option>
                                        {subjects.map((subject) => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedSubject && subjectParts.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">বিষয়ের অংশ</label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        value={selectedSubjectPart}
                                        onChange={(e) => setSelectedSubjectPart(e.target.value)}
                                    >
                                        <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                                        {subjectParts.map((part) => (
                                            <option key={part} value={part}>{part}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedSubject && chapters.length > 0 && (
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">অধ্যায়</label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                                </div>
                            )}

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isMultipleSQs}
                                    onChange={(e) => setIsMultipleSQs(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-gray-700 font-medium">একাধিক সংক্ষিপ্ত প্রশ্ন যোগ করুন</label>
                            </div>
                        </div>

                        {sqs.map((sq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">সংক্ষিপ্ত প্রশ্ন {index + 1}</h3>
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-1">প্রশ্নের ধরণ</label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4"
                                        value={sq.type}
                                        onChange={(e) => handleTypeChange(index, e.target.value)}
                                        required
                                    >
                                        <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                                        <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                                        <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                                        <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                                    </select>
                                </div>

                                <input
                                    type="text"
                                    placeholder="🔹 প্রশ্ন লিখুন"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4"
                                    value={sq.question}
                                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                                    required
                                />

                                <textarea
                                    placeholder="🔹 উত্তর লিখুন (ঐচ্ছিক)"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4 h-28"
                                    value={sq.answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                />

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">ছবি যুক্ত করুন (ঐচ্ছিক)</label>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(index, e)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <p className="text-center text-gray-500">
                                            {sq.image ? sq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                                        </p>
                                    </div>
                                </div>

                                {sq.image && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-semibold mb-2">ছবির অ্যালাইনমেন্ট</label>
                                        <select
                                            value={sq.imageAlignment}
                                            onChange={(e) => handleImageAlignmentChange(index, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        >
                                            <option value="left">বামে</option>
                                            <option value="center">মাঝে</option>
                                            <option value="right">ডানে</option>
                                        </select>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isMultipleSQs && (
                            <motion.button
                                type="button"
                                onClick={addNewSQ}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md"
                            >
                                <span className="text-xl mr-2">+</span> নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন
                            </motion.button>
                        )}

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-blue-600 text-white py-3 mt-6 rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                            ✅ সাবমিট করুন
                        </motion.button>
                    </form>
                </motion.div>

                {/* Preview Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                    <h2 className="text-xl font-bold text-blue-700 mb-4">প্রিভিউ</h2>
                    {sqs.map((sq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                        >
                            <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2">SQ</p>
                            <p className="text-lg font-semibold text-gray-900 mb-2">
                                {sq.type ? `${sq.type}: ` : ""}{sq.question || "প্রশ্ন লিখুন"}
                            </p>
                            {sq.image && (
                                <div className={`mb-4 ${sq.imageAlignment === "left" ? "text-left" : sq.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                    <img
                                        src={URL.createObjectURL(sq.image)}
                                        alt={`SQ preview ${index + 1}`}
                                        className="rounded-lg shadow-md max-h-48 inline-block"
                                    />
                                </div>
                            )}
                            {sq.answer && (
                                <p className="text-gray-700 mb-4"><span className="font-semibold">উত্তর:</span> {sq.answer}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-3">
                                Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter: {selectedChapterName || "N/A"}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}