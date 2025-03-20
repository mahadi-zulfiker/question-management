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
    const [questionType, setQuestionType] = useState("general");
    const [isMultipleQuestions, setIsMultipleQuestions] = useState(false);

    const [questions, setQuestions] = useState([{
        question: "",
        options: ["", "", "", ""],
        correctAnswer: null,
        higherOptions: ["", "", "", "", "", "", ""],
        higherCorrectAnswer: null,
        image: null,
        imageAlignment: "center",
    }]);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/mcq");
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
                const res = await fetch(`/api/mcq?classNumber=${selectedClass}`);
                const data = await res.json();
                if (data.length > 0) {
                    setSubjects([...new Set(data.map((item) => item.subject))]);
                    setSubjectParts([...new Set(data.map((item) => item.subjectPart).filter(part => part))]);
                    setChapters([...new Set(data.map((item) => ({ number: item.chapterNumber, name: item.chapterName })))]);
                }
            } catch (error) {
                toast.error("Failed to load class data");
            }
        }
        fetchClassData();
    }, [selectedClass]);

    const addNewQuestion = () => {
        setQuestions([...questions, {
            question: "",
            options: ["", "", "", ""],
            correctAnswer: null,
            higherOptions: ["", "", "", "", "", "", ""],
            higherCorrectAnswer: null,
            image: null,
            imageAlignment: "center",
        }]);
    };

    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].question = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value, type = "general") => {
        const newQuestions = [...questions];
        if (type === "general") {
            newQuestions[qIndex].options[oIndex] = value;
        } else {
            newQuestions[qIndex].higherOptions[oIndex] = value;
        }
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, value, type = "general") => {
        const newQuestions = [...questions];
        if (type === "general") {
            newQuestions[qIndex].correctAnswer = value;
        } else {
            newQuestions[qIndex].higherCorrectAnswer = value;
        }
        setQuestions(newQuestions);
    };

    const handleImageChange = (index, e) => {
        const newQuestions = [...questions];
        newQuestions[index].image = e.target.files[0];
        setQuestions(newQuestions);
    };

    const handleImageAlignmentChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].imageAlignment = value;
        setQuestions(newQuestions);
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
                        question: row.Question || "",
                        classNumber: row.Class || selectedClass,
                        subject: row.Subject || selectedSubject,
                        chapterNumber: row["Chapter Number"] || selectedChapter,
                        chapterName: row["Chapter Name"] || selectedChapterName,
                        questionType: row["MCQ Type"] || questionType,
                        options: row["MCQ Type"] === "general" || !row["MCQ Type"]
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
                        correctAnswer: row["Correct Answer"] || null,
                        imageAlignment: row["Image Alignment"] || "center",
                    }));

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
            } catch (error) {
                toast.error("❌ ফাইল প্রসেসিংয়ে ত্রুটি!");
            }
        };
        reader.readAsBinaryString(file);
    };

    const resetForm = () => {
        setSelectedClass("");
        setSelectedSubject("");
        setSelectedChapter("");
        setSelectedChapterName("");
        setSelectedSubjectPart("");
        setQuestions([{
            question: "",
            options: ["", "", "", ""],
            correctAnswer: null,
            higherOptions: ["", "", "", "", "", "", ""],
            higherCorrectAnswer: null,
            image: null,
            imageAlignment: "center",
        }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("classNumber", selectedClass);
        formData.append("subject", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart || "");
        formData.append("chapterNumber", selectedChapter);
        formData.append("chapterName", selectedChapterName);
        formData.append("questionType", questionType);
        formData.append("teacherEmail", "admin");

        questions.forEach((q, index) => {
            formData.append(`questions[${index}][question]`, q.question);
            formData.append(`questions[${index}][options]`, JSON.stringify(questionType === "general" ? q.options : q.higherOptions));
            formData.append(`questions[${index}][correctAnswer]`, questionType === "general" ? q.correctAnswer : q.higherCorrectAnswer);
            if (q.image) {
                formData.append(`questions[${index}][image]`, q.image);
            }
            formData.append(`questions[${index}][imageAlignment]`, q.imageAlignment);
        });

        try {
            const response = await fetch("/api/mcq/import", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            if (response.ok) {
                toast.success(`✅ ${questions.length}টি এমসিকিউ সফলভাবে যোগ করা হয়েছে!`, { position: "top-right" });
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
                📝 এমসিকিউ তৈরি করুন
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
                                <label className="block text-gray-700 font-semibold mb-1">প্রশ্নের ধরণ</label>
                                <select
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                    required
                                >
                                    <option value="general">সাধারণ এমসিকিউ</option>
                                    <option value="higher">উচ্চতর দক্ষতা এমসিকিউ</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isMultipleQuestions}
                                    onChange={(e) => setIsMultipleQuestions(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-gray-700 font-medium">একাধিক প্রশ্ন যোগ করুন</label>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-1">ক্লাস</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                                        value={selectedSubjectPart}
                                        onChange={(e) => setSelectedSubjectPart(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
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
                                        value={selectedChapter}
                                        onChange={(e) => {
                                            const selected = chapters.find(chap => chap.number === parseInt(e.target.value));
                                            setSelectedChapter(e.target.value);
                                            setSelectedChapterName(selected?.name || "");
                                        }}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        required
                                    >
                                        <option value="">অধ্যায় নির্বাচন করুন</option>
                                        {chapters.map((chapter) => (
                                            <option key={chapter.number} value={chapter.number}>{chapter.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {questions.map((q, qIndex) => (
                            <motion.div
                                key={qIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">প্রশ্ন {qIndex + 1}</h3>
                                <input
                                    type="text"
                                    placeholder="প্রশ্ন লিখুন"
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4"
                                    value={q.question}
                                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                    required
                                />

                                <div className="mb-4">
                                    <label className="block text-gray-700 font-semibold mb-2">ছবি যুক্ত করুন (ঐচ্ছিক)</label>
                                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(qIndex, e)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <p className="text-center text-gray-500">
                                            {q.image ? q.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                                        </p>
                                    </div>
                                </div>

                                {q.image && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-semibold mb-2">ছবির অ্যালাইনমেন্ট</label>
                                        <select
                                            value={q.imageAlignment}
                                            onChange={(e) => handleImageAlignmentChange(qIndex, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                        >
                                            <option value="left">বামে</option>
                                            <option value="center">মাঝে</option>
                                            <option value="right">ডানে</option>
                                        </select>
                                    </div>
                                )}

                                {questionType === "general" && q.options.map((option, i) => (
                                    <div key={i} className="flex items-center mb-3">
                                        <input
                                            type="text"
                                            placeholder={`বিকল্প ${i + 1}`}
                                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                                            required
                                        />
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            className="ml-3 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                            onChange={() => handleCorrectAnswerChange(qIndex, i)}
                                            checked={q.correctAnswer === i}
                                        />
                                    </div>
                                ))}

                                {questionType === "higher" && (
                                    <>
                                        {q.higherOptions.slice(0, 3).map((option, i) => (
                                            <div key={i} className="mb-3">
                                                <input
                                                    type="text"
                                                    placeholder={`বিকল্প ${i + 1}`}
                                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, i, e.target.value, "higher")}
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <h3 className="mt-4 mb-2 text-md font-bold text-gray-700">নিচের কোনটি সঠিক?</h3>
                                        {q.higherOptions.slice(3, 7).map((option, i) => (
                                            <div key={i} className="flex items-center mb-3">
                                                <input
                                                    type="text"
                                                    placeholder={`অপশন ${i + 1}`}
                                                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, i + 3, e.target.value, "higher")}
                                                    required
                                                />
                                                <input
                                                    type="radio"
                                                    name={`higherCorrect-${qIndex}`}
                                                    className="ml-3 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    onChange={() => handleCorrectAnswerChange(qIndex, i + 3, "higher")}
                                                    checked={q.higherCorrectAnswer === i + 3}
                                                />
                                            </div>
                                        ))}
                                    </>
                                )}
                            </motion.div>
                        ))}

                        {isMultipleQuestions && (
                            <motion.button
                                type="button"
                                onClick={addNewQuestion}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md"
                            >
                                <span className="text-xl mr-2">+</span> নতুন প্রশ্ন যোগ করুন
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
                    {questions.map((q, qIndex) => (
                        <motion.div
                            key={qIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                        >
                            <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2">MCQ</p>
                            <p className="text-lg font-semibold text-gray-900 mb-2">{q.question || "প্রশ্ন লিখুন"}</p>
                            {q.image && (
                                <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                    <img
                                        src={URL.createObjectURL(q.image)}
                                        alt={`MCQ preview ${qIndex + 1}`}
                                        className="rounded-lg shadow-md max-h-48 inline-block"
                                    />
                                </div>
                            )}
                            {questionType === "general" ? (
                                <div className="grid grid-cols-2 gap-4 text-gray-700">
                                    {q.options.map((opt, i) => (
                                        <p
                                            key={i}
                                            className={`p-2 rounded-lg ${q.correctAnswer === i ? "bg-green-100 font-bold text-green-800" : "text-gray-700"}`}
                                        >
                                            {String.fromCharCode(2453 + i)}. {opt || "বিকল্প লিখুন"}
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-3 text-gray-700">
                                        {q.higherOptions.slice(0, 3).map((opt, i) => (
                                            <p key={i}>{String.fromCharCode(2453 + i)}. {opt || "বিকল্প লিখুন"}</p>
                                        ))}
                                    </div>
                                    <p className="font-bold mb-2 text-gray-800">নিচের কোনটি সঠিক?</p>
                                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                                        {q.higherOptions.slice(3, 7).map((opt, i) => (
                                            <p
                                                key={i + 3}
                                                className={`p-2 rounded-lg ${q.higherCorrectAnswer === i + 3 ? "bg-green-100 font-bold text-green-800" : "text-gray-700"}`}
                                            >
                                                {String.fromCharCode(2453 + i)}. {opt || "অপশন লিখুন"}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 mt-3">
                                Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter: {selectedChapterName || "N/A"} | Type: {questionType}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}