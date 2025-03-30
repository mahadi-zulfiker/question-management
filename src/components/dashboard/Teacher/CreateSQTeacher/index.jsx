"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import dynamic from "next/dynamic";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

// Normalize text to Unicode NFC
const normalizeText = (text) => text.normalize("NFC");

export default function CreateSQTeacher() {
    const { data: session } = useSession();
    const teacherEmail = session?.user?.email || null;

    useEffect(() => {
        (async () => {
            const { addStyles } = await import("react-mathquill");
            addStyles();
        })();
    }, []);

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

    const [sqs, setSQs] = useState([
        {
            type: "জ্ঞানমূলক",
            question: "",
            answer: "",
            image: null,
            imageAlignment: "center",
            videoLink: "",
        },
    ]);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/sq");
                const data = await res.json();
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
        setSQs([
            ...sqs,
            {
                type: "জ্ঞানমূলক",
                question: "",
                answer: "",
                image: null,
                imageAlignment: "center",
                videoLink: "",
            },
        ]);
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

    const handleVideoLinkChange = (index, value) => {
        const newSQs = [...sqs];
        newSQs[index].videoLink = value;
        setSQs(newSQs);
    };

    const downloadExcelTemplate = () => {
        const templateData = [
            {
                Class: "",
                Subject: "",
                "Subject Part": "",
                "Chapter Number": "",
                "Chapter Name": "",
                Type: "",
                Question: "",
                Answer: "",
                "Image Alignment": "center",
                "Video Link": "",
            },
            {
                Class: 9,
                Subject: "General Science",
                "Subject Part": "",
                "Chapter Number": 1,
                "Chapter Name": "Chapter 1",
                Type: "জ্ঞানমূলক",
                Question: "প্রাথমিক শক্তির উৎস কী?",
                Answer: "সূর্য।",
                "Image Alignment": "center",
                "Video Link": "https://drive.google.com/file/d/example",
            },
            {
                Class: 9,
                Subject: "General Science",
                "Subject Part": "",
                "Chapter Number": 1,
                "Chapter Name": "Chapter 1",
                Type: "অনুধাবনমূলক",
                Question: "\\frac{1}{2} + \\frac{1}{3} = ?",
                Answer: "\\frac{5}{6}",
                "Image Alignment": "center",
                "Video Link": "",
            },
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SQ Template");
        XLSX.writeFile(wb, "SQ_Upload_Template.xlsx");
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
                    const extractedQuestions = data.map((row) => ({
                        type: row.Type || "জ্ঞানমূলক",
                        question: normalizeText(row.Question || ""),
                        answer: normalizeText(row.Answer || ""),
                        classLevel: row.Class || selectedClass,
                        subjectName: row.Subject || selectedSubject,
                        subjectPart: row["Subject Part"] || selectedSubjectPart,
                        chapterNumber: row["Chapter Number"] || selectedChapterNumber,
                        chapterName: row["Chapter Name"] || selectedChapterName,
                        imageAlignment: row["Image Alignment"] || "center",
                        videoLink: row["Video Link"] || "",
                        teacherEmail,
                    }));

                    const response = await fetch("/api/sq/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ questions: extractedQuestions }),
                    });

                    if (response.ok) {
                        toast.success("প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
                    } else {
                        const errorData = await response.json();
                        toast.error(`❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ হয়েছে: ${errorData.error}`);
                    }
                } else {
                    toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
                }
            } catch (error) {
                console.error("Excel processing error:", error);
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
        setIsMultipleSQs(false);
        setSQs([
            {
                type: "জ্ঞানমূলক",
                question: "",
                answer: "",
                image: null,
                imageAlignment: "center",
                videoLink: "",
            },
        ]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!teacherEmail) {
            toast.error("❌ প্রশ্ন সাবমিট করতে লগইন করুন!");
            return;
        }

        const formData = new FormData();
        formData.append("classLevel", selectedClass);
        formData.append("subjectName", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart || "");
        formData.append("chapterNumber", selectedChapterNumber);
        formData.append("chapterName", selectedChapterName);
        formData.append("teacherEmail", teacherEmail);

        sqs.forEach((sq, index) => {
            formData.append(`sqs[${index}][type]`, sq.type);
            formData.append(`sqs[${index}][question]`, sq.question);
            formData.append(`sqs[${index}][answer]`, sq.answer);
            if (sq.image) formData.append(`sqs[${index}][image]`, sq.image);
            formData.append(`sqs[${index}][imageAlignment]`, sq.imageAlignment);
            formData.append(`sqs[${index}][videoLink]`, sq.videoLink || "");
        });

        try {
            const response = await fetch("/api/sq/import", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            if (response.ok) {
                toast.success(`✅ ${sqs.length}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
                resetForm();
            } else {
                toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!");
        }
    };

    return (
        <>
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML" async></script>
                <style>{`
                    .bangla-text { font-family: 'Noto Sans Bengali', sans-serif; }
                    .video-link { color: #1a73e8; text-decoration: underline; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 0.375rem; transition: background-color 0.2s; }
                    .video-link:hover { background-color: #e8f0fe; }
                    .form-section, .preview-section { min-height: 80vh; }
                    .math-field { border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.75rem; background: white; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
                `}</style>
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-8">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-extrabold text-center text-blue-700 mb-10 bangla-text"
                >
                    📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন (শিক্ষক)
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 form-section"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <label className="block text-gray-700 font-semibold text-lg mb-3 bangla-text">
                                    এক্সেল ফাইল থেকে আমদানি
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <p className="text-center text-gray-500 text-lg bangla-text">
                                        এক্সেল ফাইল টেনে আনুন বা ক্লিক করুন
                                    </p>
                                </div>
                                <motion.button
                                    type="button"
                                    onClick={downloadExcelTemplate}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition shadow-md text-lg bangla-text"
                                >
                                    📥 এক্সেল টেমপ্লেট ডাউনলোড করুন
                                </motion.button>
                            </div>
                            <p className="text-center text-gray-500 mb-6 text-lg bangla-text">অথবা</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">ক্লাস</label>
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(Number(e.target.value))}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">বিষয়</label>
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">বিষয়ের অংশ</label>
                                        <select
                                            value={selectedSubjectPart}
                                            onChange={(e) => setSelectedSubjectPart(e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">অধ্যায়</label>
                                        <select
                                            value={selectedChapterNumber}
                                            onChange={(e) => {
                                                const selected = chapters.find((chap) => chap.chapterNumber === parseInt(e.target.value));
                                                setSelectedChapterNumber(e.target.value);
                                                setSelectedChapterName(selected?.chapterName || "");
                                            }}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label className="ml-3 text-gray-700 font-semibold text-lg bangla-text">
                                        একাধিক সংক্ষিপ্ত প্রশ্ন যোগ করুন
                                    </label>
                                </div>
                            </div>

                            {sqs.map((sq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-8 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                                >
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 bangla-text">
                                        সংক্ষিপ্ত প্রশ্ন {index + 1}
                                    </h3>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                            প্রশ্নের ধরণ
                                        </label>
                                        <select
                                            value={sq.type}
                                            onChange={(e) => handleTypeChange(index, e.target.value)}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-6 text-lg bangla-text"
                                            required
                                        >
                                            <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                                            <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                                            <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                                            <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                            প্রশ্ন লিখুন
                                        </label>
                                        <EditableMathField
                                            latex={sq.question}
                                            onChange={(mathField) => handleQuestionChange(index, mathField.latex())}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text math-field"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                            উত্তর লিখুন (ঐচ্ছিক)
                                        </label>
                                        <EditableMathField
                                            latex={sq.answer}
                                            onChange={(mathField) => handleAnswerChange(index, mathField.latex())}
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text math-field"
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                            ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                                            value={sq.videoLink}
                                            onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                            ছবি যুক্ত করুন (ঐচ্ছিক)
                                        </label>
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(index, e)}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <p className="text-center text-gray-500 text-lg bangla-text">
                                                {sq.image ? sq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                                            </p>
                                        </div>
                                    </div>

                                    {sq.image && (
                                        <div className="mb-6">
                                            <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                                                ছবির অ্যালাইনমেন্ট
                                            </label>
                                            <select
                                                value={sq.imageAlignment}
                                                onChange={(e) => handleImageAlignmentChange(index, e.target.value)}
                                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                                    className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 transition shadow-md text-lg bangla-text flex items-center justify-center"
                                >
                                    <span className="text-xl mr-2">+</span> নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন
                                </motion.button>
                            )}

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-blue-600 text-white py-3 mt-8 rounded-lg hover:bg-blue-700 transition shadow-md text-lg bangla-text"
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
                        className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 preview-section"
                    >
                        <h2 className="text-2xl font-bold text-blue-700 mb-6 bangla-text">প্রিভিউ</h2>
                        {sqs.map((sq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                            >
                                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-3 bangla-text">
                                    SQ {index + 1}
                                </p>
                                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                                    প্রশ্ন: {sq.type}
                                </p>
                                <StaticMathField className="text-gray-700 mb-4 bangla-text">
                                    {sq.question || "প্রশ্ন লিখুন"}
                                </StaticMathField>

                                {sq.videoLink && (
                                    <div className="mb-4">
                                        <a href={sq.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                                            📹 ভিডিও দেখুন
                                        </a>
                                    </div>
                                )}

                                {sq.image && (
                                    <div
                                        className={`mb-4 ${sq.imageAlignment === "left" ? "text-left" : sq.imageAlignment === "right" ? "text-right" : "text-center"}`}
                                    >
                                        <img
                                            src={URL.createObjectURL(sq.image)}
                                            alt={`SQ preview ${index + 1}`}
                                            className="rounded-lg shadow-md max-h-64 inline-block"
                                        />
                                    </div>
                                )}

                                {sq.answer && (
                                    <div className="text-gray-700 mb-4">
                                        <p className="font-semibold bangla-text">উত্তর:</p>
                                        <StaticMathField className="text-gray-700 bangla-text">
                                            {sq.answer || "উত্তর লিখুন"}
                                        </StaticMathField>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 mt-4 bangla-text">
                                    ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | অংশ: {selectedSubjectPart || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"}
                                </p>
                            </motion.div>
                        ))}
                        {sqs.length === 0 && (
                            <p className="text-gray-500 text-center text-lg bangla-text">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
}