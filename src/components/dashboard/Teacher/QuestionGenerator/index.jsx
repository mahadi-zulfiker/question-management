"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import dynamic from "next/dynamic";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

export default function QuestionGenerator() {
    useEffect(() => {
        (async () => {
            const { addStyles } = await import("react-mathquill");
            addStyles();
        })();
    }, []);

    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState("");
    const [classNumber, setClassNumber] = useState("");
    const [subject, setSubject] = useState("");
    const [chapterNumber, setChapterNumber] = useState("");
    const [search, setSearch] = useState("");
    const [schoolName, setSchoolName] = useState("");
    const [schoolAddress, setSchoolAddress] = useState("");
    const [examName, setExamName] = useState("");
    const [examTime, setExamTime] = useState("");
    const [examMarks, setExamMarks] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [segmentName, setSegmentName] = useState("");
    const [questionSetNumber, setQuestionSetNumber] = useState("");
    const [subjectCodeNumber, setSubjectCodeNumber] = useState("");
    const [information, setInformation] = useState("");
    const [preview, setPreview] = useState(false);
    const [classNumbers, setClassNumbers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [chapters, setChapters] = useState([]);

    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return await res.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                console.log(`Retrying fetch (${i + 1}/${retries})...`, error.message);
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const data = await fetchWithRetry("/api/questionPaper?fetchFilters=true");
                if (data.success) {
                    setClassNumbers(data.data.classNumbers || []);
                    setSubjects(data.data.subjects || []);
                    setChapters(data.data.chapters || []);
                } else {
                    toast.error("ফিল্টার লোড করতে ব্যর্থ!");
                }
            } catch (error) {
                console.error("Failed to fetch filters:", error);
                toast.error("সার্ভার ত্রুটি! দয়া করে পুনরায় চেষ্টা করুন।");
            }
        };
        fetchFilters();
    }, []);

    const fetchQuestions = async () => {
        if (!type || !classNumber || !subject || !chapterNumber) {
            toast.error("সমস্ত ফিল্টার নির্বাচন করুন!");
            return;
        }

        setLoading(true);
        try {
            const data = await fetchWithRetry(`/api/questionPaper?type=${type}&classNumber=${classNumber}&subject=${subject}&chapterNumber=${chapterNumber}&search=${encodeURIComponent(search)}`);
            if (data.success) {
                setQuestions(data.data || []);
            } else {
                setQuestions([]);
                toast.error("প্রশ্ন লোড করতে ব্যর্থ!");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setQuestions([]);
            toast.error("সার্ভার ত্রুটি! দয়া করে পুনরায় চেষ্টা করুন।");
        }
        setLoading(false);
    };

    const handleSelectQuestion = (question) => {
        setSelectedQuestions((prev) => {
            if (prev.some(q => q._id === question._id)) {
                return prev.filter(q => q._id !== question._id);
            }
            return [...prev, question];
        });
    };

    const handleGeneratePDF = async () => {
        const trimmedSchoolName = schoolName.trim();
        const trimmedSchoolAddress = schoolAddress.trim();
        const trimmedExamName = examName.trim();
        const trimmedExamTime = examTime.trim();
        const trimmedExamMarks = examMarks.trim();
        const trimmedSubjectName = subjectName.trim();
        const trimmedSegmentName = segmentName.trim();
        const trimmedQuestionSetNumber = questionSetNumber.trim();
        const trimmedSubjectCodeNumber = subjectCodeNumber.trim();
        const trimmedInformation = information.trim();

        if (
            !trimmedSchoolName ||
            !trimmedSchoolAddress ||
            !trimmedExamName ||
            !trimmedExamTime ||
            !trimmedExamMarks ||
            !trimmedSubjectName ||
            !trimmedSegmentName ||
            selectedQuestions.length === 0
        ) {
            toast.error("সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন এবং কমপক্ষে একটি প্রশ্ন নির্বাচন করুন!");
            return;
        }

        const parsedExamTime = parseInt(trimmedExamTime, 10);
        const parsedExamMarks = parseInt(trimmedExamMarks, 10);
        if (isNaN(parsedExamTime) || isNaN(parsedExamMarks) || parsedExamTime <= 0 || parsedExamMarks <= 0) {
            toast.error("পরীক্ষার সময় এবং পূর্ণমান অবশ্যই বৈধ ধনাত্মক সংখ্যা হতে হবে!");
            return;
        }

        for (const q of selectedQuestions) {
            if (trimmedSegmentName === "MCQ") {
                if (!q.question || !Array.isArray(q.options)) {
                    toast.error("নির্বাচিত এমসিকিউ প্রশ্নে প্রশ্ন এবং অপশন থাকতে হবে!");
                    return;
                }
            } else if (trimmedSegmentName === "CQ") {
                if (!q.passage || !Array.isArray(q.questions) || !Array.isArray(q.marks)) {
                    toast.error("নির্বাচিত সৃজনশীল প্রশ্নে উদ্দীপক, প্রশ্ন এবং নম্বর থাকতে হবে!");
                    return;
                }
            } else if (trimmedSegmentName === "SQ") {
                if (!q.question || !q.type) {
                    toast.error("নির্বাচিত সংক্ষিপ্ত প্রশ্নে প্রশ্ন এবং ধরণ থাকতে হবে!");
                    return;
                }
            }
        }

        try {
            const response = await fetch("/api/questionPaper", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    schoolName: trimmedSchoolName,
                    schoolAddress: trimmedSchoolAddress,
                    examName: trimmedExamName,
                    examTime: trimmedExamTime,
                    examMarks: trimmedExamMarks,
                    subjectName: trimmedSubjectName,
                    segmentName: trimmedSegmentName,
                    questionSetNumber: trimmedQuestionSetNumber,
                    subjectCodeNumber: trimmedSubjectCodeNumber,
                    information: trimmedInformation,
                    selectedQuestions,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${trimmedExamName}-${trimmedSubjectName}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success("প্রশ্নপত্র সফলভাবে ডাউনলোড হয়েছে!");
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "প্রশ্নপত্র তৈরি করতে ব্যর্থ!");
            }
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("সার্ভার ত্রুটি!");
        }
    };

    const sanitizeContent = (content) => {
        if (!content) return "N/A";
        return content.replace(/<\/?[^>]+(>|$)/g, "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"');
    };

    return (
        <>
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet" />
                <style>{`
                    .bangla-text {
                        font-family: 'Noto Sans Bengali', sans-serif;
                    }
                    .input-focus {
                        transition: all 0.2s ease;
                    }
                    .input-focus:focus {
                        ring: 2px;
                        ring-color: #3b82f6;
                        border-color: #3b82f6;
                    }
                    .preview-container {
                        max-width: 595px; /* A4 width in points at 72dpi */
                        margin: 0 auto;
                        font-size: 12px;
                        line-height: 1.2;
                    }
                    .mcq-options {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 4px 8px;
                        margin-top: 4px;
                    }
                `}</style>
            </Head>
            <div className="p-6 max-w-7xl mx-auto bg-white min-h-screen">
                <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 bangla-text">📝 প্রশ্নপত্র তৈরি</h1>

                {/* Filters */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 bangla-text">প্রশ্ন ফিল্টার</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <select
                            value={type}
                            onChange={(e) => { setType(e.target.value); setSelectedQuestions([]); }}
                            className="p-3 border border-gray-300 rounded-lg input-focus bg-white shadow-sm bangla-text"
                            aria-label="প্রশ্নের ধরণ"
                        >
                            <option value="">প্রশ্নের ধরণ নির্বাচন</option>
                            <option value="mcq">এমসিকিউ</option>
                            <option value="cq">সৃজনশীল প্রশ্ন</option>
                            <option value="sq">সংক্ষিপ্ত প্রশ্ন</option>
                        </select>
                        <select
                            value={classNumber}
                            onChange={(e) => setClassNumber(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bg-white shadow-sm bangla-text"
                            aria-label="ক্লাস"
                        >
                            <option value="">ক্লাস নির্বাচন</option>
                            {classNumbers.map((num) => (
                                <option key={num} value={num}>ক্লাস {num}</option>
                            ))}
                        </select>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bg-white shadow-sm bangla-text"
                            aria-label="বিষয়"
                        >
                            <option value="">বিষয় নির্বাচন</option>
                            {subjects.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        <select
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bg-white shadow-sm bangla-text"
                            aria-label="অধ্যায়"
                        >
                            <option value="">অধ্যায় নির্বাচন</option>
                            {chapters.map((chap) => (
                                <option key={chap.number} value={chap.number}>{chap.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="প্রশ্ন খুঁজুন..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg input-focus bg-white shadow-sm bangla-text"
                                aria-label="প্রশ্ন অনুসন্ধান"
                            />
                            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
                        </div>
                    </div>
                    <button
                        onClick={fetchQuestions}
                        disabled={loading}
                        className={`mt-4 w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 bangla-text ${loading ? 'cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                লোড হচ্ছে...
                            </span>
                        ) : (
                            'প্রশ্ন লোড করুন'
                        )}
                    </button>
                </div>

                {/* Question Paper Details */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 bangla-text">প্রশ্নপত্রের বিবরণ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="স্কুলের নাম..."
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="স্কুলের নাম"
                        />
                        <input
                            type="text"
                            placeholder="স্কুলের ঠিকানা..."
                            value={schoolAddress}
                            onChange={(e) => setSchoolAddress(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="স্কুলের ঠিকানা"
                        />
                        <input
                            type="text"
                            placeholder="পরীক্ষার নাম..."
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="পরীক্ষার নাম"
                        />
                        <input
                            type="text"
                            placeholder="পরীক্ষার সময় (মিনিটে)..."
                            value={examTime}
                            onChange={(e) => setExamTime(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="পরীক্ষার সময়"
                        />
                        <input
                            type="text"
                            placeholder="পূর্ণমান..."
                            value={examMarks}
                            onChange={(e) => setExamMarks(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="পূর্ণমান"
                        />
                        <input
                            type="text"
                            placeholder="বিষয়ের নাম..."
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="বিষয়ের নাম"
                        />
                        <select
                            value={segmentName}
                            onChange={(e) => setSegmentName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="বিভাগ"
                        >
                            <option value="">বিভাগ নির্বাচন</option>
                            <option value="MCQ">এমসিকিউ</option>
                            <option value="CQ">সৃজনশীল প্রশ্ন</option>
                            <option value="SQ">সংক্ষিপ্ত প্রশ্ন</option>
                        </select>
                        <input
                            type="text"
                            placeholder="প্রশ্ন সেট নম্বর (ঐচ্ছিক)..."
                            value={questionSetNumber}
                            onChange={(e) => setQuestionSetNumber(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="প্রশ্ন সেট নম্বর"
                        />
                        <input
                            type="text"
                            placeholder="বিষয় কোড নম্বর (ঐচ্ছিক)..."
                            value={subjectCodeNumber}
                            onChange={(e) => setSubjectCodeNumber(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text"
                            aria-label="বিষয় কোড নম্বর"
                        />
                        <textarea
                            placeholder="তথ্য (ঐচ্ছিক)..."
                            value={information}
                            onChange={(e) => setInformation(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg input-focus bangla-text col-span-2"
                            rows="3"
                            aria-label="তথ্য"
                        />
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {questions.length > 0 ? (
                            questions.map((q) => (
                                <div key={q._id} className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestions.some(sq => sq._id === q._id)}
                                                onChange={() => handleSelectQuestion(q)}
                                                className="mr-2 h-5 w-5 text-blue-600"
                                            />
                                            <span className="bangla-text">নির্বাচন করুন</span>
                                        </label>
                                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full bangla-text">
                                            {q.type.toUpperCase()}
                                        </span>
                                    </div>
                                    {q.type === "mcq" && (
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                                                প্রশ্ন: <StaticMathField>{sanitizeContent(q.question)}</StaticMathField>
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(q.options || []).map((opt, i) => (
                                                    <p key={i} className="text-gray-700 bangla-text">
                                                        {String.fromCharCode(2453 + i)}. <StaticMathField>{sanitizeContent(opt)}</StaticMathField>
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {q.type === "cq" && (
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                                            <StaticMathField className="text-gray-700 mb-4 bangla-text">
                                                {sanitizeContent(q.passage) || "কোনো উদ্দীপক দেওয়া হয়নি"}
                                            </StaticMathField>
                                            <div className="text-gray-900">
                                                {(q.questions || []).map((ques, i) => (
                                                    <p key={i} className="mb-2 bangla-text">
                                                        {String.fromCharCode(2453 + i)}) <StaticMathField>{sanitizeContent(ques)}</StaticMathField> {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {q.type === "sq" && (
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                                                প্রশ্ন ({q.type}): <StaticMathField>{sanitizeContent(q.question)}</StaticMathField>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-12 bangla-text">কোনো প্রশ্ন পাওয়া যায়নি। অন্য ফিল্টার ব্যবহার করুন।</p>
                        )}
                    </div>
                )}

                {/* Preview and Download Buttons */}
                {selectedQuestions.length > 0 && (
                    <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
                        <button
                            onClick={() => setPreview(!preview)}
                            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition bangla-text"
                        >
                            {preview ? "প্রিভিউ বন্ধ করুন" : "প্রিভিউ দেখুন"}
                        </button>
                        <button
                            onClick={handleGeneratePDF}
                            disabled={loading}
                            className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 bangla-text ${loading ? 'cursor-not-allowed' : ''}`}
                        >
                            প্রশ্নপত্র ডাউনলোড (PDF)
                        </button>
                    </div>
                )}

                {/* Preview Section */}
                {preview && selectedQuestions.length > 0 && (
                    <div className="mt-8 p-6 border border-gray-200 rounded-xl shadow-sm bg-white preview-container">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h2 className="text-lg font-bold bangla-text">{schoolName}</h2>
                                <p className="text-sm bangla-text">{schoolAddress}</p>
                            </div>
                            {(questionSetNumber || subjectCodeNumber) && (
                                <div className="text-right text-sm bangla-text">
                                    {questionSetNumber && <p>বিভাগ কোড: {questionSetNumber}</p>}
                                    {subjectCodeNumber && <p>বিষয় কোড: {subjectCodeNumber}</p>}
                                </div>
                            )}
                        </div>
                        <h3 className="text-base font-semibold mb-1 text-center bangla-text">{examName}</h3>
                        <p className="text-center text-sm bangla-text">বিষয়: {subjectName}</p>
                        <div className="flex justify-between text-sm mb-2">
                            <p className="bangla-text">সময়: {examTime} মিনিট</p>
                            <p className="bangla-text">পূর্ণমান: {examMarks}</p>
                        </div>
                        {information && (
                            <div className="mb-2 bangla-text">
                                <p className="font-semibold text-sm">বিশেষ নির্দেশাবলী:</p>
                                <p className="text-sm">{information}</p>
                            </div>
                        )}
                        <h4 className="text-sm font-semibold text-center bangla-text mb-4">বিভাগ: {segmentName}</h4>
                        <div>
                            {segmentName === "MCQ" && selectedQuestions.map((q, index) => (
                                <div key={q._id} className="mb-4">
                                    <p className="text-sm bangla-text mb-1">{index + 1}. <StaticMathField>{sanitizeContent(q.question)}</StaticMathField></p>
                                    {q.options.length > 4 ? (
                                        <>
                                            {q.options.slice(0, 3).map((opt, i) => (
                                                <p key={i} className="text-xs bangla-text ml-4">
                                                    {String.fromCharCode(2453 + i)}) <StaticMathField>{sanitizeContent(opt)}</StaticMathField>
                                                </p>
                                            ))}
                                            <p className="text-xs bangla-text ml-4 mt-1">নিচের কোনটি সঠিক?</p>
                                            <div className="mcq-options ml-4">
                                                {q.options.slice(3).map((opt, i) => (
                                                    <p key={i} className="text-xs bangla-text">
                                                        {String.fromCharCode(2453 + i)}) <StaticMathField>{sanitizeContent(opt)}</StaticMathField>
                                                    </p>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="mcq-options ml-4">
                                            {q.options.map((opt, i) => (
                                                <p key={i} className="text-xs bangla-text">
                                                    {String.fromCharCode(2453 + i)}) <StaticMathField>{sanitizeContent(opt)}</StaticMathField>
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {segmentName === "CQ" && selectedQuestions.map((q, index) => (
                                <div key={q._id} className="mb-4">
                                    <p className="text-sm font-medium bangla-text">প্রশ্ন {index + 1}:</p>
                                    <p className="text-xs bangla-text">উদ্দীপক: <StaticMathField>{sanitizeContent(q.passage)}</StaticMathField></p>
                                    {q.questions.map((ques, i) => (
                                        <p key={i} className="mt-1 text-xs bangla-text">
                                            {String.fromCharCode(2453 + i)}) <StaticMathField>{sanitizeContent(ques)}</StaticMathField> ({q.marks[i]} নম্বর)
                                        </p>
                                    ))}
                                </div>
                            ))}
                            {segmentName === "SQ" && selectedQuestions.map((q, index) => (
                                <div key={q._id} className="mb-2">
                                    <p className="text-sm bangla-text">{index + 1}. ({q.type}) <StaticMathField>{sanitizeContent(q.question)}</StaticMathField></p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}