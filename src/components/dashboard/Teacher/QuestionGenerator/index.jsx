"use client";

import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import dynamic from "next/dynamic";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

// Convert LaTeX to plain text (same as backend)
const convertLatexToText = (latex) => {
  if (!latex || typeof latex !== "string") return "N/A";
  try {
    return latex
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
      .replace(/\{([^}]+)\}/g, "$1")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/\^(\d+)/g, "^$1")
      .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
      .replace(/\\times/g, "×")
      .replace(/\\div/g, "÷")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\pi/g, "π")
      .replace(/\\infty/g, "∞")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\neq/g, "≠")
      .replace(/\\pm/g, "±")
      .replace(/\\[a-zA-Z]+/g, "");
  } catch (error) {
    console.error("Error converting LaTeX:", error);
    return latex;
  }
};

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
  const [activeTab, setActiveTab] = useState("questions");
  const [classNumbers, setClassNumbers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const previewRef = useRef(null);

  const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        console.log(`Retrying fetch (${i + 1}/${retries})...`, error.message);
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
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
          toast.error("ফিল্টার লোড করতে ব্যর্থ!", { position: "top-center" });
        }
      } catch (error) {
        console.error("Failed to fetch filters:", error);
        toast.error("সার্ভার ত্রুটি! দয়া করে পুনরায় চেষ্টা করুন।", { position: "top-center" });
      }
    };
    fetchFilters();
  }, []);

  const fetchQuestions = async () => {
    if (!type || !classNumber || !subject || !chapterNumber) {
      toast.error("সমস্ত ফিল্টার নির্বাচন করুন!", { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWithRetry(
        `/api/questionPaper?type=${type}&classNumber=${classNumber}&subject=${subject}&chapterNumber=${chapterNumber}&search=${encodeURIComponent(
          search
        )}`
      );
      if (data.success) {
        setQuestions(data.data || []);
      } else {
        setQuestions([]);
        toast.error("প্রশ্ন লোড করতে ব্যর্থ!", { position: "top-center" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setQuestions([]);
      toast.error("সার্ভার ত্রুটি! দয়া করে পুনরায় চেষ্টা করুন।", { position: "top-center" });
    }
    setLoading(false);
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestions((prev) => {
      if (prev.some((q) => q._id === question._id)) {
        return prev.filter((q) => q._id !== question._id);
      }
      return [...prev, question];
    });
  };

  const handleClearSelected = () => {
    setSelectedQuestions([]);
    toast.info("নির্বাচিত প্রশ্ন মুছে ফেলা হয়েছে!", { position: "top-center" });
  };

  const handleClearFilters = () => {
    setType("");
    setClassNumber("");
    setSubject("");
    setChapterNumber("");
    setSearch("");
    setQuestions([]);
    toast.info("ফিল্টার রিসেট করা হয়েছে!", { position: "top-center" });
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
      toast.error("সমস্ত প্রয়োজনীয় তথ্য পূরণ করুন এবং কমপক্ষে একটি প্রশ্ন নির্বাচন করুন!", { position: "top-center" });
      return;
    }

    const parsedExamTime = parseInt(trimmedExamTime, 10);
    const parsedExamMarks = parseInt(trimmedExamMarks, 10);
    if (isNaN(parsedExamTime) || isNaN(parsedExamMarks) || parsedExamTime <= 0 || parsedExamMarks <= 0) {
      toast.error("পরীক্ষার সময় এবং পূর্ণমান অবশ্যই বৈধ ধনাত্মক সংখ্যা হতে হবে!", { position: "top-center" });
      return;
    }

    for (const q of selectedQuestions) {
      if (trimmedSegmentName === "MCQ") {
        if (!q.question || !Array.isArray(q.options)) {
          toast.error("নির্বাচিত এমসিকিউ প্রশ্নে প্রশ্ন এবং অপশন থাকতে হবে!", { position: "top-center" });
          return;
        }
      } else if (trimmedSegmentName === "CQ") {
        if (!q.passage || !Array.isArray(q.questions) || !Array.isArray(q.marks)) {
          toast.error("নির্বাচিত সৃজনশীল প্রশ্নে উদ্দীপক, প্রশ্ন এবং নম্বর থাকতে হবে!", { position: "top-center" });
          return;
        }
      } else if (trimmedSegmentName === "SQ") {
        if (!q.question || !q.type) {
          toast.error("নির্বাচিত সংক্ষিপ্ত প্রশ্নে প্রশ্ন এবং ধরণ থাকতে হবে!", { position: "top-center" });
          return;
        }
      }
    }

    try {
      setLoading(true);
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
        toast.success("প্রশ্নপত্র সফলভাবে ডাউনলোড হয়েছে!", { position: "top-center" });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "প্রশ্নপত্র তৈরি করতে ব্যর্থ!", { position: "top-center" });
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("সার্ভার ত্রুটি!", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const sanitizeContent = (content) => {
    if (!content) return "N/A";
    return content.replace(/<\/?[^>]+(>|$)/g, "").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"');
  };

  // Simulate PDF page breaks for preview
  const renderPreviewPages = () => {
    const pages = [];
    let currentPage = { content: [], height: 0 };
    const maxPageHeight = 842 - 60; // A4 height minus margins (30pt top + bottom)
    const margin = 30;
    const contentWidth = 595 - 2 * margin;

    const addToPage = (content, height) => {
      if (currentPage.height + height > maxPageHeight) {
        pages.push(currentPage);
        currentPage = { content: [], height: 0 };
      }
      currentPage.content.push(content);
      currentPage.height += height;
    };

    // Header
    addToPage(
      <div key="header">
        <h2 className="text-[14pt] font-bold text-center">{schoolName || "N/A"}</h2>
        <p className="text-[10pt] text-center">{schoolAddress || "N/A"}</p>
        <div className="h-[5pt]" />
        <h3 className="text-[12pt] font-semibold text-center">{examName || "N/A"}</h3>
        <p className="text-[10pt] text-center">বিষয়: {subjectName || "N/A"}</p>
        <div className="h-[5pt]" />
        {(questionSetNumber || subjectCodeNumber) && (
          <p className="text-[10pt] text-right">
            {questionSetNumber && `বিভাগ কোড: ${questionSetNumber}`}
            {questionSetNumber && subjectCodeNumber && "  "}
            {subjectCodeNumber && `বিষয় কোড: ${subjectCodeNumber}`}
          </p>
        )}
        <div className="flex justify-between text-[10pt]">
          <p>সময়: {examTime} মিনিট</p>
          <p>পূর্ণমান: {examMarks}</p>
        </div>
        {information && (
          <div className="mt-[5pt]">
            <p className="text-[10pt] font-semibold">বিশেষ নির্দেশাবলী:</p>
            <p className="text-[9pt]">{information}</p>
          </div>
        )}
        <h4 className="text-[11pt] font-semibold text-center mt-[10pt]">বিভাগ: {segmentName}</h4>
      </div>,
      100
    );

    // Questions
    selectedQuestions.forEach((q, index) => {
      if (segmentName === "MCQ") {
        const questionText = convertLatexToText(sanitizeContent(q.question));
        const options = (q.options || []).map((opt, i) => (
          <p key={i} className="text-[7pt] ml-[10pt]">
            {String.fromCharCode(97 + i)}) {convertLatexToText(sanitizeContent(opt))}
          </p>
        ));
        addToPage(
          <div key={q._id || index} className="mt-[8pt]">
            <p className="text-[8pt]">{`${index + 1}. ${questionText}`}</p>
            <div className="mt-[2pt]">{options}</div>
          </div>,
          40 + options.length * 10
        );
      } else if (segmentName === "CQ") {
        const passage = convertLatexToText(sanitizeContent(q.passage));
        const subQuestions = (q.questions || []).map((ques, i) => (
          <p key={i} className="text-[9pt] ml-[10pt]">
            {String.fromCharCode(97 + i)}) {convertLatexToText(sanitizeContent(ques))} ({q.marks[i] || 0} নম্বর)
          </p>
        ));
        addToPage(
          <div key={q._id || index} className="mt-[10pt]">
            <p className="text-[10pt] font-medium">প্রশ্ন {index + 1}:</p>
            <p className="text-[9pt] italic">উদ্দীপক: {passage}</p>
            <div className="mt-[5pt]">{subQuestions}</div>
          </div>,
          60 + subQuestions.length * 15
        );
      } else if (segmentName === "SQ") {
        const questionText = convertLatexToText(sanitizeContent(q.question));
        addToPage(
          <div key={q._id || index} className="mt-[8pt]">
            <p className="text-[9pt]">{`${index + 1}. (${q.type || "N/A"}) ${questionText}`}</p>
          </div>,
          20
        );
      }
    });

    if (currentPage.content.length > 0) {
      pages.push(currentPage);
    }

    return pages.map((page, index) => (
      <div
        key={index}
        className="bg-white shadow-md mb-[20pt] p-[30pt] w-[595pt] h-[842pt] box-border relative"
        style={{ fontFamily: "'Noto Sans Bengali', Helvetica, sans-serif" }}
      >
        {page.content}
        <div className="absolute bottom-[20pt] w-full flex justify-between text-[8pt]">
          <p>{`${examName || "N/A"} - ${subjectName || "N/A"}`}</p>
          <p>পৃষ্ঠা {index + 1} / {pages.length}</p>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Head>
        <title>প্রশ্নপত্র জেনারেটর</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          .bangla-text {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .input-focus {
            transition: all 0.2s ease;
            border-color: #d1d5db;
          }
          .input-focus:focus {
            outline: none;
            ring: 2px;
            ring-color: #3b82f6;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .sidebar {
            width: 25%;
            min-width: 300px;
            max-width: 400px;
            transition: width 0.3s ease;
          }
          .sidebar.collapsed {
            width: 60px;
            min-width: 60px;
          }
          .main-content {
            width: 75%;
            max-height: calc(100vh - 80px);
            overflow-y: auto;
          }
          .tab {
            transition: background-color 0.2s ease;
          }
          .tab.active {
            background-color: #3b82f6;
            color: white;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #3b82f6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 1024px) {
            .sidebar {
              position: fixed;
              left: -300px;
              width: 300px;
              height: 100vh;
              transition: left 0.3s ease;
            }
            .sidebar.open {
              left: 0;
            }
            .main-content {
              width: 100%;
            }
            .preview-container {
              transform: scale(0.7);
              transform-origin: top;
            }
          }
        `}</style>
      </Head>
      <div className="flex min-h-screen bg-gray-100">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          theme="colored"
          toastStyle={{ backgroundColor: "#3b82f6", color: "white", fontFamily: "'Noto Sans Bengali', sans-serif" }}
        />

        {/* Sidebar */}
        <div
          className={`sidebar bg-white shadow-md p-6 flex flex-col gap-6 ${
            isSidebarCollapsed ? "collapsed" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            {!isSidebarCollapsed && (
              <h2 className="text-xl font-bold bangla-text">নিয়ন্ত্রণ প্যানেল</h2>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-600 hover:text-gray-800"
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? "▶" : "◀"}
            </button>
          </div>

          {!isSidebarCollapsed && (
            <>
              {/* Filters */}
              <div>
                <h3 className="text-lg font-semibold mb-3 bangla-text">প্রশ্ন ফিল্টার</h3>
                <div className="space-y-3">
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setSelectedQuestions([]);
                    }}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="প্রশ্নের ধরণ"
                    disabled={loading}
                  >
                    <option value="">প্রশ্নের ধরণ নির্বাচন</option>
                    <option value="mcq">এমসিকিউ</option>
                    <option value="cq">সৃজনশীল প্রশ্ন</option>
                    <option value="sq">সংক্ষিপ্ত প্রশ্ন</option>
                  </select>
                  <select
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="ক্লাস"
                    disabled={loading}
                  >
                    <option value="">ক্লাস নির্বাচন</option>
                    {classNumbers.map((num) => (
                      <option key={num} value={num}>
                        ক্লাস {num}
                      </option>
                    ))}
                  </select>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="বিষয়"
                    disabled={loading}
                  >
                    <option value="">বিষয় নির্বাচন</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  <select
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="অধ্যায়"
                    disabled={loading}
                  >
                    <option value="">অধ্যায় নির্বাচন</option>
                    {chapters.map((chap) => (
                      <option key={chap.number} value={chap.number}>
                        {chap.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="প্রশ্ন খুঁজুন..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full p-2 border rounded-lg input-focus bangla-text"
                      aria-label="প্রশ্ন অনুসন্ধান"
                      disabled={loading}
                    />
                    <span className="absolute right-2 top-2 text-gray-400">🔍</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchQuestions}
                      disabled={loading}
                      className={`flex-1 py-2 px-4 rounded-lg transition bangla-text ${
                        loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      aria-label="প্রশ্ন লোড করুন"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <span className="spinner mr-2" />
                          লোড হচ্ছে...
                        </span>
                      ) : (
                        "প্রশ্ন লোড"
                      )}
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition bangla-text"
                      aria-label="ফিল্টার রিসেট করুন"
                      disabled={loading}
                    >
                      রিসেট
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Paper Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3 bangla-text">প্রশ্নপত্রের বিবরণ</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="স্কুলের নাম *"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="স্কুলের নাম"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="স্কুলের ঠিকানা *"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="স্কুলের ঠিকানা"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="পরীক্ষার নাম *"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="পরীক্ষার নাম"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="পরীক্ষার সময় (মিনিট) *"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="পরীক্ষার সময়"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="পূর্ণমান *"
                    value={examMarks}
                    onChange={(e) => setExamMarks(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="পূর্ণমান"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="বিষয়ের নাম *"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="বিষয়ের নাম"
                    disabled={loading}
                  />
                  <select
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="বিভাগ"
                    disabled={loading}
                  >
                    <option value="">বিভাগ নির্বাচন *</option>
                    <option value="MCQ">এমসিকিউ</option>
                    <option value="CQ">সৃজনশীল প্রশ্ন</option>
                    <option value="SQ">সংক্ষিপ্ত প্রশ্ন</option>
                  </select>
                  <input
                    type="text"
                    placeholder="প্রশ্ন সেট নম্বর (ঐচ্ছিক)"
                    value={questionSetNumber}
                    onChange={(e) => setQuestionSetNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="প্রশ্ন সেট নম্বর"
                    disabled={loading}
                  />
                  <input
                    type="text"
                    placeholder="বিষয় কোড নম্বর (ঐচ্ছিক)"
                    value={subjectCodeNumber}
                    onChange={(e) => setSubjectCodeNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    aria-label="বিষয় কোড নম্বর"
                    disabled={loading}
                  />
                  <textarea
                    placeholder="তথ্য (ঐচ্ছিক)"
                    value={information}
                    onChange={(e) => setInformation(e.target.value)}
                    className="w-full p-2 border rounded-lg input-focus bangla-text"
                    rows="3"
                    aria-label="তথ্য"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-sm bangla-text">নির্বাচিত প্রশ্ন: {selectedQuestions.length}</p>
                <button
                  onClick={handleClearSelected}
                  className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition bangla-text"
                  aria-label="নির্বাচিত প্রশ্ন মুছুন"
                  disabled={loading || selectedQuestions.length === 0}
                >
                  নির্বাচিত প্রশ্ন মুছুন
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={loading || selectedQuestions.length === 0}
                  className={`w-full py-2 px-4 rounded-lg transition bangla-text ${
                    loading || selectedQuestions.length === 0
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  aria-label="পিডিএফ ডাউনলোড করুন"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="spinner mr-2" />
                      তৈরি হচ্ছে...
                    </span>
                  ) : (
                    "পিডিএফ ডাউনলোড"
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="main-content p-6">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("questions")}
              className={`py-2 px-4 rounded-t-lg tab bangla-text ${
                activeTab === "questions" ? "active" : "bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label="প্রশ্ন তালিকা"
            >
              প্রশ্ন তালিকা
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-2 px-4 rounded-t-lg tab bangla-text ${
                activeTab === "preview" ? "active" : "bg-gray-200 hover:bg-gray-300"
              }`}
              aria-label="প্রিভিউ"
            >
              প্রিভিউ
            </button>
          </div>

          {activeTab === "questions" && (
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="spinner" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {questions.length > 0 ? (
                    questions.map((q) => (
                      <div
                        key={q._id}
                        className="border p-6 rounded-xl shadow-sm hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.some((sq) => sq._id === q._id)}
                              onChange={() => handleSelectQuestion(q)}
                              className="mr-2 h-5 w-5 text-blue-600"
                              aria-label={`প্রশ্ন নির্বাচন ${q._id}`}
                              disabled={loading}
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
                                  {String.fromCharCode(97 + i)}.{" "}
                                  <StaticMathField>{sanitizeContent(opt)}</StaticMathField>
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {q.type === "cq" && (
                          <div>
                            <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                              উদ্দীপক:
                            </p>
                            <StaticMathField className="text-gray-700 mb-4 bangla-text">
                              {sanitizeContent(q.passage) || "কোনো উদ্দীপক দেওয়া হয়নি"}
                            </StaticMathField>
                            <div className="text-gray-900">
                              {(q.questions || []).map((ques, i) => (
                                <p key={i} className="mb-2 bangla-text">
                                  {String.fromCharCode(97 + i)}) <StaticMathField>{sanitizeContent(ques)}</StaticMathField>{" "}
                                  {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
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
                    <p className="text-center text-gray-500 py-12 bangla-text">
                      কোনো প্রশ্ন পাওয়া যায়নি। অন্য ফিল্টার ব্যবহার করুন।
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "preview" && selectedQuestions.length > 0 && (
            <div className="preview-container max-h-[calc(100vh-150px)] overflow-y-auto">
              {renderPreviewPages()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}