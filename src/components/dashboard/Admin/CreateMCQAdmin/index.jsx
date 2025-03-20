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
        image: null // Added image field
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
            image: null
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
            image: null
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
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-6"
        >
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">📝 এমসিকিউ তৈরি করুন</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" style={{ fontWeight: "bold" }}>
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
                    value={questionType} 
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full p-2 border rounded mb-3" 
                    required
                >
                    <option value="general">সাধারণ এমসিকিউ</option>
                    <option value="higher">উচ্চতর দক্ষতা এমসিকিউ</option>
                </select>

                <div className="flex items-center mb-3">
                    <input
                        type="checkbox"
                        checked={isMultipleQuestions}
                        onChange={(e) => setIsMultipleQuestions(e.target.checked)}
                        className="mr-2"
                    />
                    <label>একাধিক প্রশ্ন যোগ করুন</label>
                </div>

                <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2 border rounded mb-3" 
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
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full p-2 border rounded mb-3" 
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
                        value={selectedSubjectPart} 
                        onChange={(e) => setSelectedSubjectPart(e.target.value)}
                        className="w-full p-2 border rounded mb-3"
                    >
                        <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                        {subjectParts.map((part) => (
                            <option key={part} value={part}>{part}</option>
                        ))}
                    </select>
                )}

                {selectedSubject && chapters.length > 0 && (
                    <select 
                        value={selectedChapter} 
                        onChange={(e) => {
                            const selected = chapters.find(chap => chap.number === parseInt(e.target.value));
                            setSelectedChapter(e.target.value);
                            setSelectedChapterName(selected?.name || "");
                        }}
                        className="w-full p-2 border rounded mb-3" 
                        required
                    >
                        <option value="">অধ্যায় নির্বাচন করুন</option>
                        {chapters.map((chapter) => (
                            <option key={chapter.number} value={chapter.number}>{chapter.name}</option>
                        ))}
                    </select>
                )}

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="mb-6 p-4 border rounded bg-gray-50">
                        <h3 className="text-lg font-semibold mb-2">প্রশ্ন {qIndex + 1}</h3>
                        <input
                            type="text"
                            placeholder="প্রশ্ন লিখুন"
                            className="w-full p-2 border rounded mb-3"
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                            required
                        />

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" style={{ fontWeight: "bold" }}>
                                প্রশ্নের সাথে ছবি যুক্ত করুন (ঐচ্ছিক)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(qIndex, e)}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        {questionType === "general" && q.options.map((option, i) => (
                            <div key={i} className="flex items-center mb-2">
                                <input
                                    type="text"
                                    placeholder={`বিকল্প ${i + 1}`}
                                    className="flex-1 p-2 border rounded"
                                    value={option}
                                    onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                                    required
                                />
                                <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    className="ml-2"
                                    onChange={() => handleCorrectAnswerChange(qIndex, i)}
                                    checked={q.correctAnswer === i}
                                />
                            </div>
                        ))}

                        {questionType === "higher" && (
                            <>
                                {q.higherOptions.slice(0, 3).map((option, i) => (
                                    <div key={i} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder={`বিকল্প ${i + 1}`}
                                            className="flex-1 p-2 border rounded"
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value, "higher")}
                                            required
                                        />
                                    </div>
                                ))}
                                <h3 className="mt-4 mb-2 text-lg font-bold text-gray-700">নিচের কোনটি সঠিক?</h3>
                                {q.higherOptions.slice(3, 7).map((option, i) => (
                                    <div key={i} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder={`অপশন ${i + 1}`}
                                            className="flex-1 p-2 border rounded"
                                            value={option}
                                            onChange={(e) => handleOptionChange(qIndex, i + 3, e.target.value, "higher")}
                                            required
                                        />
                                        <input
                                            type="radio"
                                            name={`higherCorrect-${qIndex}`}
                                            className="ml-2"
                                            onChange={() => handleCorrectAnswerChange(qIndex, i + 3, "higher")}
                                            checked={q.higherCorrectAnswer === i + 3}
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                ))}

                {isMultipleQuestions && (
                    <button
                        type="button"
                        onClick={addNewQuestion}
                        className="w-full bg-green-500 text-white py-2 mt-3 rounded hover:bg-green-600 transition flex items-center justify-center"
                    >
                        <span className="text-xl mr-2">+</span> নতুন প্রশ্ন যোগ করুন
                    </button>
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