"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { MathJax } from "better-react-mathjax";
import FormatToolbar from "../../../FormatToolbar/index";

// Normalize text to Unicode NFC
const normalizeText = (text) => text.normalize("NFC");

// Compute the Greatest Common Divisor (GCD) using Euclidean algorithm
const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

// Simplify a fraction
const simplifyFraction = (numerator, denominator) => {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
};

// Process text for LaTeX conversion
const processTextForLatex = (text) => {
  // Normalize and clean text
  text = normalizeText(text).replace(/[\u200B-\u200F\uFEFF]/g, "");

  // Handle mixed fractions (e.g., "1 1/2" → "1\\ \\frac{1}{2}")
  text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, whole, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `${whole}\\ \\frac{${numerator}}{${denominator}}`;
  });

  // Handle fractions (e.g., "1/2" → "\frac{1}{2}")
  text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
    const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
    return `\\frac{${numerator}}{${denominator}}`;
  });

  // Handle superscripts (e.g., "x^2" → "x^{2}", "[(x^2 + 3x + 1)]^2" → "[(x^{2} + 3x + 1)]^{2}")
  text = text.replace(/\[(.*?)\]\^(\d+|\w+)/g, "[$1]^{$2}");
  text = text.replace(/\((.*?)\)\^(\d+|\w+)/g, "($1)^{$2}");
  text = text.replace(/(\w+)\^(\d+|\w+)/g, "$1^{$2}");

  // Handle square roots (e.g., "sqrt(x)" → "\sqrt{x}")
  text = text.replace(/sqrt\((.*?)\)/g, "\\sqrt{$1}");

  // Handle common symbols
  text = text.replace(/≥/g, "\\geq");
  text = text.replace(/≤/g, "\\leq");
  text = text.replace(/≠/g, "\\neq");
  text = text.replace(/½/g, "\\frac{1}{2}");
  text = text.replace(/²/g, "^{2}");
  text = text.replace(/³/g, "^{3}");

  // Preserve markdown formatting if present
  text = text.replace(/\*\*(.*?)\*\*/g, "**$1**");
  text = text.replace(/\*(.*?)\*/g, "*$1*");
  text = text.replace(/__(.*?)__/g, "__$1__");

  // Wrap Bangla text in \text{}
  text = text.replace(
    /([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯]+(?:\s+[ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ০-৯]+)*(?:[।,:;]|\s|$))/g,
    (match) => {
      const content = match.trim();
      const trailing = match.slice(content.length);
      if (!/^\d+$/.test(content) && !content.includes("/")) {
        return `\\text{${content}}${trailing}`;
      }
      return match;
    }
  );

  return text;
};

// Render markdown and LaTeX in preview
const renderLines = (text) => {
  if (!text) return 'প্রশ্ন বা বিকল্প লিখুন...';

  return text.split('\n').map((line, index) => {
    // Process markdown-style formatting
    let processedLine = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');

    // If the line contains LaTeX (e.g., \frac, ^, _), ensure it's rendered as math
    if (processedLine.match(/[\\{}^_]/) && !processedLine.startsWith('$') && !processedLine.endsWith('$')) {
      processedLine = `$${processedLine}$`;
    }

    return (
      <div key={index}>
        <MathJax>
          <div dangerouslySetInnerHTML={{ __html: processedLine }} />
        </MathJax>
      </div>
    );
  });
};

// Main CreateMCQAdmin Component
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

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: null,
      higherOptions: ["", "", "", "", "", "", ""],
      higherCorrectAnswer: null,
      image: null,
      imageAlignment: "center",
      videoLink: "",
    },
  ]);

  const [toolbarPosition, setToolbarPosition] = useState(null);
  const [activeField, setActiveField] = useState(null); // Track which field (question/option) and index
  const textareaRefs = useRef({}); // Store refs for textareas

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/mcq");
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        toast.error("ক্লাস লোড করতে ব্যর্থ");
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
        setSelectedChapter("");
        setSelectedChapterName("");
        return;
      }

      try {
        const res = await fetch(`/api/mcq?classNumber=${selectedClass}`);
        const data = await res.json();
        if (data.length > 0) {
          setSubjects([...new Set(data.map((item) => item.subject))]);
          setSubjectParts([...new Set(data.map((item) => item.subjectPart).filter((part) => part))]);
          const chapterMap = new Map();
          data.forEach((item) => {
            const key = `${item.chapterNumber}-${item.chapterName}`;
            if (!chapterMap.has(key)) chapterMap.set(key, { number: item.chapterNumber, name: item.chapterName });
          });
          setChapters(Array.from(chapterMap.values()));
        } else {
          setSubjects([]);
          setSubjectParts([]);
          setChapters([]);
          toast.info("⚠️ এই ক্লাসের জন্য কোনো ডেটা নেই।");
        }
      } catch (error) {
        toast.error("ক্লাস ডেটা লোড করতে ব্যর্থ");
      }
    }
    fetchClassData();
  }, [selectedClass]);

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: null,
        higherOptions: ["", "", "", "", "", "", ""],
        higherCorrectAnswer: null,
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = processTextForLatex(value);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value, type = "general") => {
    const newQuestions = [...questions];
    if (type === "general") {
      newQuestions[qIndex].options[oIndex] = processTextForLatex(value);
    } else {
      newQuestions[qIndex].higherOptions[oIndex] = processTextForLatex(value);
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

  const handleVideoLinkChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].videoLink = value;
    setQuestions(newQuestions);
  };

  const handleSelection = (qIndex, fieldType, oIndex, e) => {
    const textarea = textareaRefs.current[`${fieldType}-${qIndex}-${oIndex ?? ''}`];
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (selection.toString().length > 0) {
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
      });
      setActiveField({ qIndex, fieldType, oIndex });
    } else {
      setToolbarPosition(null);
      setActiveField(null);
    }
  };

  const handleFormat = (format, e) => {
    e.preventDefault(); // Prevent form submission
    if (!activeField) return;

    const { qIndex, fieldType, oIndex } = activeField;
    const newQuestions = [...questions];
    const textarea = textareaRefs.current[`${fieldType}-${qIndex}-${oIndex ?? ''}`];
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let currentText;
    if (fieldType === "question") {
      currentText = newQuestions[qIndex].question;
    } else if (fieldType === "option") {
      currentText = questionType === "general"
        ? newQuestions[qIndex].options[oIndex]
        : newQuestions[qIndex].higherOptions[oIndex];
    }

    const selectedText = currentText.substring(start, end);
    if (!selectedText) return;

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'math':
        formattedText = `$${selectedText}$`;
        break;
    }

    const updatedText = currentText.substring(0, start) + formattedText + currentText.substring(end);
    if (fieldType === "question") {
      newQuestions[qIndex].question = updatedText;
    } else if (fieldType === "option") {
      if (questionType === "general") {
        newQuestions[qIndex].options[oIndex] = updatedText;
      } else {
        newQuestions[qIndex].higherOptions[oIndex] = updatedText;
      }
    }

    setQuestions(newQuestions);
    setToolbarPosition(null);
    setActiveField(null);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        Class: "",
        Subject: "",
        "Chapter Number": "",
        "Chapter Name": "",
        "MCQ Type": "general",
        Question: "",
        "Option 1": "",
        "Option 2": "",
        "Option 3": "",
        "Option 4": "",
        "Option 5": "",
        "Option 6": "",
        "Option 7": "",
        "Correct Answer": "",
        "Image Alignment": "center",
        "Video Link": "",
      },
      {
        Class: 9,
        Subject: "General Math",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "MCQ Type": "general",
        Question: "What is voltage?",
        "Option 1": "How affect current?",
        "Option 2": "Calculate current",
        "Option 3": "Design a simple",
        "Option 4": "Circuit",
        "Option 5": "",
        "Option 6": "",
        "Option 7": "",
        "Correct Answer": 0,
        "Image Alignment": "center",
        "Video Link": "https://drive.google.com/file/d/example",
      },
      {
        Class: 9,
        Subject: "General Math",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "MCQ Type": "higher",
        Question: "1 1/2 + 1/3 = ?",
        "Option 1": "এক",
        "Option 2": "দুই",
        "Option 3": "তিন",
        "Option 4": "চার",
        "Option 5": "\\frac{5}{6}",
        "Option 6": "1\\ \\frac{5}{6}",
        "Option 7": "\\frac{2}{5}",
        "Correct Answer": 6,
        "Image Alignment": "center",
        "Video Link": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MCQ Template");
    XLSX.writeFile(wb, "MCQ_Upload_Template.xlsx");
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
            question: processTextForLatex(normalizeText(row.Question || "")),
            classNumber: row.Class || selectedClass,
            subject: row.Subject || selectedSubject,
            chapterNumber: row["Chapter Number"] || selectedChapter,
            chapterName: row["Chapter Name"] || selectedChapterName,
            questionType: row["MCQ Type"] || questionType,
            options:
              row["MCQ Type"] === "general" || !row["MCQ Type"]
                ? [
                    processTextForLatex(row["Option 1"] || ""),
                    processTextForLatex(row["Option 2"] || ""),
                    processTextForLatex(row["Option 3"] || ""),
                    processTextForLatex(row["Option 4"] || ""),
                  ]
                : [
                    processTextForLatex(row["Option 1"] || ""),
                    processTextForLatex(row["Option 2"] || ""),
                    processTextForLatex(row["Option 3"] || ""),
                    processTextForLatex(row["Option 4"] || ""),
                    processTextForLatex(row["Option 5"] || ""),
                    processTextForLatex(row["Option 6"] || ""),
                    processTextForLatex(row["Option 7"] || ""),
                  ],
            correctAnswer: row["Correct Answer"] || null,
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/mcq/import", {
            method: "POST:",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
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
    setQuestionType("general");
    setIsMultipleQuestions(false);
    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: null,
        higherOptions: ["", "", "", "", "", "", ""],
        higherCorrectAnswer: null,
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
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
      if (q.image) formData.append(`questions[${index}][image]`, q.image);
      formData.append(`questions[${index}][imageAlignment]`, q.imageAlignment);
      formData.append(`questions[${index}][videoLink]`, q.videoLink);
    });

    try {
      const response = await fetch("/api/mcq/import", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${questions.length}টি এমসিকিউ সফলভাবে যোগ করা হয়েছে!`);
        resetForm();
      } else {
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
      }
    } catch (error) {
      toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!");
    }
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalpurush&display=swap" rel="stylesheet" />
        <script>
          {`
            MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                tags: 'ams',
              },
              chtml: {
                scale: 1.1,
                mtextInheritFont: true,
              }
            };
          `}
        </script>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
      </Head>
      <style jsx global>{`
        .bangla-text {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          direction: ltr;
          unicode-bidi: embed;
        }
        .video-link {
          color: #1a73e8;
          text-decoration: underline;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        .video-link:hover {
          background-color: #e8f0fe;
        }
        .form-section, .preview-section {
          min-height: 80vh;
        }
        textarea.bangla-text {
          min-height: 50px !important;
          height: auto !important;
          overflow-y: auto !important;
          max-height: 200px !important;
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          padding: 12px !important;
          box-sizing: border-box !important;
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          font-size: 18px !important;
          line-height: 1.5 !important;
          border: 1px solid #d1d5db !important;
          border-radius: 6px !important;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
        }
        .MathJax .mtext {
          font-family: 'Kalpurush', 'Noto Sans Bengali', sans-serif !important;
          white-space: pre-wrap !important;
          margin-right: 0.25em !important;
          margin-left: 0.25em !important;
        }
        .MathJax .mspace {
          width: 0.5em !important;
        }
        .MathJax .mo {
          font-size: 1.2em !important;
          vertical-align: top !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 এমসিকিউ তৈরি করুন
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 form-section"
          >
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                  এক্সেল ফাইল থেকে আমদানি
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <p className="text-center text-gray-500 bangla-text">
                    এক্সেল ফাইল টেনে আনুন বা ক্লিক করুন
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={downloadExcelTemplate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md bangla-text"
                >
                  📥 এক্সেল টেমপ্লেট ডাউনলোড করুন
                </motion.button>
              </div>
              <p className="text-center text-gray-500 mb-4 bangla-text">অথবা</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">প্রশ্নের ধরণ</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
                    একাধিক প্রশ্ন যোগ করুন
                  </label>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">ক্লাস</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">বিষয়</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">বিষয়ের অংশ</label>
                    <select
                      value={selectedSubjectPart}
                      onChange={(e) => setSelectedSubjectPart(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">অধ্যায়</label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => {
                        const selected = chapters.find((chap) => chap.number === parseInt(e.target.value));
                        setSelectedChapter(e.target.value);
                        setSelectedChapterName(selected?.name || "");
                      }}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                  className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200 relative"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                    প্রশ্ন {qIndex + 1}
                  </h3>
                  <div className="mb-4 relative">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">প্রশ্ন লিখুন</label>
                    <textarea
                      className="w-full p-4 border rounded mb-4 font-mono bangla-text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      onMouseUp={(e) => handleSelection(qIndex, "question", null, e)}
                      onKeyUp={(e) => handleSelection(qIndex, "question", null, e)}
                      rows={4}
                      ref={(el) => (textareaRefs.current[`question-${qIndex}-`] = el)}
                    />
                    <FormatToolbar
                      position={toolbarPosition && activeField?.qIndex === qIndex && activeField?.fieldType === "question" ? toolbarPosition : null}
                      onFormat={handleFormat}
                    />
                    <p className="text-sm text-gray-500 mt-1 bangla-text">
                      * Word থেকে পেস্ট করলে সঠিকভাবে না দেখালে LaTeX ফরম্যাটে লিখুন (যেমন: 1 1/2, \\frac{1}{2})
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={q.videoLink}
                      onChange={(e) => handleVideoLinkChange(qIndex, e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ছবি যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(qIndex, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 bangla-text">
                        {q.image ? q.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {q.image && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={q.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(qIndex, e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      >
                        <option value="left">বামে</option>
                        <option value="center">মাঝে</option>
                        <option value="right">ডানে</option>
                      </select>
                    </div>
                  )}

                  {questionType === "general" && (
                    <>
                      {q.options.map((option, i) => (
                        <div key={i} className="flex items-center mb-3 relative">
                          <textarea
                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                            onMouseUp={(e) => handleSelection(qIndex, "option", i, e)}
                            onKeyUp={(e) => handleSelection(qIndex, "option", i, e)}
                            rows={2}
                            ref={(el) => (textareaRefs.current[`option-${qIndex}-${i}`] = el)}
                          />
                          <FormatToolbar
                            position={toolbarPosition && activeField?.qIndex === qIndex && activeField?.fieldType === "option" && activeField?.oIndex === i ? toolbarPosition : null}
                            onFormat={handleFormat}
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
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * Word থেকে পেস্ট করলে সঠিকভাবে না দেখালে LaTeX ফরম্যাটে লিখুন (যেমন: 1 1/2, \\frac{1}{2})
                      </p>
                    </>
                  )}

                  {questionType === "higher" && (
                    <>
                      {q.higherOptions.slice(0, 3).map((option, i) => (
                        <div key={i} className="mb-3 relative">
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value, "higher")}
                            onMouseUp={(e) => handleSelection(qIndex, "option", i, e)}
                            onKeyUp={(e) => handleSelection(qIndex, "option", i, e)}
                            rows={2}
                            ref={(el) => (textareaRefs.current[`option-${qIndex}-${i}`] = el)}
                          />
                          <FormatToolbar
                            position={toolbarPosition && activeField?.qIndex === qIndex && activeField?.fieldType === "option" && activeField?.oIndex === i ? toolbarPosition : null}
                            onFormat={handleFormat}
                          />
                        </div>
                      ))}
                      <h3 className="mt-4 mb-2 text-md font-bold text-gray-700 bangla-text">
                        নিচের কোনটি সঠিক?
                      </h3>
                      {q.higherOptions.slice(3, 7).map((option, i) => (
                        <div key={i + 3} className="flex items-center mb-3 relative">
                          <textarea
                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, i + 3, e.target.value, "higher")}
                            onMouseUp={(e) => handleSelection(qIndex, "option", i + 3, e)}
                            onKeyUp={(e) => handleSelection(qIndex, "option", i + 3, e)}
                            rows={2}
                            ref={(el) => (textareaRefs.current[`option-${qIndex}-${i + 3}`] = el)}
                          />
                          <FormatToolbar
                            position={toolbarPosition && activeField?.qIndex === qIndex && activeField?.fieldType === "option" && activeField?.oIndex === i + 3 ? toolbarPosition : null}
                            onFormat={handleFormat}
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
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * Word থেকে পেস্ট করলে সঠিকভাবে না দেখালে LaTeX ফরম্যাটে লিখুন (যেমন: 1 1/2, \\frac{1}{2})
                      </p>
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
                  className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md bangla-text"
                >
                  <span className="text-xl mr-2">+</span> নতুন প্রশ্ন যোগ করুন
                </motion.button>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 mt-6 rounded-lg hover:bg-blue-700 transition shadow-md bangla-text"
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
            {questions.map((q, qIndex) => (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-3 bangla-text">
                  MCQ {qIndex + 1}
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">প্রশ্ন:</p>
                <div className="text-gray-700 mb-4 bangla-text">
                  {renderLines(q.question || "প্রশ্ন লিখুন")}
                </div>

                {q.videoLink && (
                  <div className="mb-4">
                    <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}

                {q.image && (
                  <div
                    className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}
                  >
                    <img
                      src={URL.createObjectURL(q.image)}
                      alt={`MCQ preview ${qIndex + 1}`}
                      className="rounded-lg shadow-md max-h-64 inline-block"
                    />
                  </div>
                )}

                {questionType === "general" ? (
                  <div className="grid grid-cols-2 gap-4 text-gray-700">
                    {q.options.map((opt, i) => (
                      <p
                        key={i}
                        className={`p-2 rounded-lg ${q.correctAnswer === i ? "bg-green-100 font-bold text-green-800" : "text-gray-700"} bangla-text`}
                      >
                        {String.fromCharCode(2453 + i)}. {renderLines(opt || "প্রশ্ন বা বিকল্প লিখুন...")}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 text-gray-700">
                      {q.higherOptions.slice(0, 3).map((opt, i) => (
                        <p key={i} className="bangla-text">
                          {String.fromCharCode(2453 + i)}. {renderLines(opt || "প্রশ্ন বা বিকল্প লিখুন...")}
                        </p>
                      ))}
                    </div>
                    <p className="font-bold mb-2 text-gray-800 bangla-text">নিচের কোনটি সঠিক?</p>
                    <div className="grid grid-cols-2 gap-4 text-gray-700">
                      {q.higherOptions.slice(3, 7).map((opt, i) => (
                        <p
                          key={i + 3}
                          className={`p-2 rounded-lg ${q.higherCorrectAnswer === i + 3 ? "bg-green-100 font-bold text-green-800" : "text-gray-700"} bangla-text`}
                        >
                          {String.fromCharCode(2453 + i)}. {renderLines(opt || "প্রশ্ন বা বিকল্প লিখুন...")}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | অংশ: {selectedSubjectPart || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"} | ধরণ: {questionType}
                </p>
              </motion.div>
            ))}
            {questions.length === 0 && (
              <p className="text-gray-500 text-center text-lg bangla-text">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}