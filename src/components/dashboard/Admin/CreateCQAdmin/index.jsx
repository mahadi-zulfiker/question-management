"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

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
    const [cqType, setCQType] = useState("");
    const [isMultipleCQs, setIsMultipleCQs] = useState(false);

    const [cqs, setCQs] = useState([{
        passage: "",
        questions: ["", "", "", ""],
        mathQuestions: ["", "", ""],
        image: null,
        imageAlignment: "center",
    }]);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/cq");
                const data = await res.json();
                setClasses(data);
            } catch (error) {
                toast.error("Failed to load classes");
            }
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) return;
            try {
                const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
                const data = await res.json();
                if (data.length > 0) {
                    setSubjects([...new Set(data.map((item) => item.subject))]);
                    setSubjectParts([...new Set(data.map((item) => item.subjectPart).filter(part => part))]);
                    setChapters([...new Set(data.map((item) => ({
                        number: item.chapterNumber,
                        name: item.chapterName
                    })))]);
                }
            } catch (error) {
                toast.error("Failed to load class data");
            }
        }
        fetchClassData();
    }, [selectedClass]);

    const addNewCQ = () => {
        setCQs([...cqs, {
            passage: "",
            questions: ["", "", "", ""],
            mathQuestions: ["", "", ""],
            image: null,
            imageAlignment: "center",
        }]);
    };

    const handlePassageChange = (index, value) => {
        const newCQs = [...cqs];
        newCQs[index].passage = value;
        setCQs(newCQs);
    };

    const handleQuestionChange = (cqIndex, qIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].questions[qIndex] = value;
        setCQs(newCQs);
    };

    const handleMathQuestionChange = (cqIndex, qIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].mathQuestions[qIndex] = value;
        setCQs(newCQs);
    };

    const handleImageChange = (cqIndex, e) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].image = e.target.files[0];
        setCQs(newCQs);
    };

    const handleImageAlignmentChange = (cqIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].imageAlignment = value;
        setCQs(newCQs);
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
                        passage: row.Passage || "",
                        classNumber: row.Class || selectedClass,
                        subject: row.Subject || selectedSubject,
                        chapterNumber: row["Chapter Number"] || selectedChapter,
                        chapterName: row["Chapter Name"] || selectedChapterName,
                        cqType: row["CQ Type"],
                        questions: row["CQ Type"] === "generalCQ"
                            ? [
                                row["Knowledge Question"] || "",
                                row["Comprehension Question"] || "",
                                row["Application Question"] || "",
                                row["Higher Skills Question"] || ""
                            ]
                            : [
                                row["Knowledge Question"] || "",
                                row["Application Question"] || "",
                                row["Higher Skills Question"] || ""
                            ],
                        imageAlignment: row["Image Alignment"] || "center",
                    }));

                    const response = await fetch("/api/cq/import", {
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
        setChapters([]);
        setSelectedChapter("");
        setSelectedChapterName("");
        setSubjectParts([]);
        setSelectedSubjectPart("");
        setCQType("");
        setCQs([{ passage: "", questions: ["", "", "", ""], mathQuestions: ["", "", ""], image: null, imageAlignment: "center" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("classNumber", selectedClass);
        formData.append("subject", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart || "");
        formData.append("chapterNumber", selectedChapter);
        formData.append("chapterName", selectedChapterName);
        formData.append("teacherEmail", "admin");
        formData.append("cqType", cqType);

        cqs.forEach((cq, index) => {
            formData.append(`cqs[${index}][passage]`, cq.passage);
            formData.append(`cqs[${index}][questions]`, JSON.stringify(cqType === "generalCQ" ? cq.questions : cq.mathQuestions));
            if (cq.image) {
                formData.append(`cqs[${index}][image]`, cq.image);
            }
            formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
        });

        try {
            const response = await fetch("/api/cq/import", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            if (response.ok) {
                toast.success(`✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`, { position: "top-right" });
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
                📝 সৃজনশীল প্রশ্ন তৈরি করুন
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
                                        value={selectedChapter}
                                        onChange={(e) => {
                                            const selected = chapters.find(chap => chap.number === parseInt(e.target.value));
                                            setSelectedChapter(e.target.value);
                                            setSelectedChapterName(selected?.name || "");
                                        }}
                                        required
                                    >
                                        <option value="">অধ্যায় নির্বাচন করুন</option>
                                        {chapters.map((chapter) => (
                                            <option key={chapter.number} value={chapter.number}>{chapter.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">প্রশ্নের ধরণ</label>
                                <select
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    value={cqType}
                                    onChange={(e) => setCQType(e.target.value)}
                                    required
                                >
                                    <option value="">সৃজনশীল প্রশ্নের ধরণ নির্বাচন করুন</option>
                                    <option value="generalCQ">সাধারণ সৃজনশীল প্রশ্ন</option>
                                    <option value="mathCQ">গাণিতিক সৃজনশীল প্রশ্ন</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isMultipleCQs}
                                    onChange={(e) => setIsMultipleCQs(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-gray-700 font-medium">একাধিক সৃজনশীল প্রশ্ন যোগ করুন</label>
                            </div>
                        </div>

                        {cqs.map((cq, cqIndex) => (
                            <motion.div
                                key={cqIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">সৃজনশীল প্রশ্ন {cqIndex + 1}</h3>
                                <textarea
                                    placeholder="🔹 অনুচ্ছেদ লিখুন"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4 h-28"
                                    value={cq.passage}
                                    onChange={(e) => handlePassageChange(cqIndex, e.target.value)}
                                    required
                                />
                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">ছবি যুক্ত করুন (ঐচ্ছিক)</label>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(cqIndex, e)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <p className="text-center text-gray-500">
                                            {cq.image ? cq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                                        </p>
                                    </div>
                                </div>

                                {cq.image && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-semibold mb-2">ছবির অ্যালাইনমেন্ট</label>
                                        <select
                                            value={cq.imageAlignment}
                                            onChange={(e) => handleImageAlignmentChange(cqIndex, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        >
                                            <option value="left">বামে</option>
                                            <option value="center">মাঝে</option>
                                            <option value="right">ডানে</option>
                                        </select>
                                    </div>
                                )}

                                {cqType === "generalCQ" && cq.questions.map((question, i) => (
                                    <div key={i} className="mb-3">
                                        <input
                                            type="text"
                                            placeholder={
                                                i === 0 ? "জ্ঞানমূলক প্রশ্ন" :
                                                i === 1 ? "অনুধাবনমূলক প্রশ্ন" :
                                                i === 2 ? "প্রয়োগ প্রশ্ন" :
                                                "উচ্চতর দক্ষতা"
                                            }
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                            value={question}
                                            onChange={(e) => handleQuestionChange(cqIndex, i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}

                                {cqType === "mathCQ" && cq.mathQuestions.map((question, i) => (
                                    <div key={i} className="mb-3">
                                        <input
                                            type="text"
                                            placeholder={
                                                i === 0 ? "জ্ঞানমূলক প্রশ্ন" :
                                                i === 1 ? "প্রয়োগ প্রশ্ন" :
                                                "উচ্চতর দক্ষতা"
                                            }
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                            value={question}
                                            onChange={(e) => handleMathQuestionChange(cqIndex, i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        ))}

                        {isMultipleCQs && (
                            <motion.button
                                type="button"
                                onClick={addNewCQ}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md"
                            >
                                <span className="text-xl mr-2">+</span> নতুন সৃজনশীল প্রশ্ন যোগ করুন
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
                    {cqs.map((cq, cqIndex) => (
                        <motion.div
                            key={cqIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                        >
                            <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2">CQ</p>
                            <p className="text-lg font-semibold text-gray-900 mb-2">উদ্দীপক:</p>
                            <p className="text-gray-700 mb-4">{cq.passage || "অনুচ্ছেদ লিখুন"}</p>
                            {cq.image && (
                                <div className={`mb-4 ${cq.imageAlignment === "left" ? "text-left" : cq.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                    <img
                                        src={URL.createObjectURL(cq.image)}
                                        alt={`CQ preview ${cqIndex + 1}`}
                                        className="rounded-lg shadow-md max-h-64 inline-block"
                                    />
                                </div>
                            )}
                            <div className="text-gray-700">
                                {(cqType === "generalCQ" ? cq.questions : cq.mathQuestions).map((ques, i) => (
                                    <p key={i} className="mb-2">
                                        {String.fromCharCode(2453 + i)}) {ques || "প্রশ্ন লিখুন"} {cqType === "generalCQ" ? `(${[1, 2, 3, 4][i]} নম্বর)` : `(${[2, 3, 4][i]} নম্বর)`}
                                    </p>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter: {selectedChapterName || "N/A"} | Type: {cqType || "N/A"}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}