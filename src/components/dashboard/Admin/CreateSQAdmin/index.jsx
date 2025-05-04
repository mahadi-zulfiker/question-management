"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import FormatToolbar from "../../../FormatToolbar/index";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Dynamically import MathJax to avoid SSR issues
const MathJax = dynamic(
  () => import("better-react-mathjax").then((mod) => mod.MathJax),
  {
    ssr: false,
  }
);

// Normalize text to Unicode NFC and remove problematic characters
const normalizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFC")
    .replace(/[\u200B-\u200F\uFEFF]/g, "") // Remove zero-width spaces and control chars
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
};

// Compute GCD for fraction simplification
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

// Process text for LaTeX conversion with Bangla/number separation
const processTextForLatex = (text) => {
  if (!text || typeof text !== "string") return "";

  try {
    text = normalizeText(text);

    // Protect LaTeX and markdown syntax
    const placeholders = [];
    let placeholderIndex = 0;

    // Store markdown and LaTeX patterns
    text = text.replace(/(\*\*.*?\*\*|\*.*?\*|__.*?__|\$.*?\$)/g, (match) => {
      placeholders.push(match);
      return `__PLACEHOLDER_${placeholderIndex++}__`;
    });

    // Convert fractions (e.g., 1/2 -> \frac{1}{2})
    text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, whole, num, denom) => {
      if (denom === "0") return match;
      const { numerator, denominator } = simplifyFraction(
        parseInt(num),
        parseInt(denom)
      );
      return `${whole}\\ \\frac{${numerator}}{${denominator}}`;
    });
    text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
      if (denom === "0") return match;
      const { numerator, denominator } = simplifyFraction(
        parseInt(num),
        parseInt(denom)
      );
      return `\\frac{${numerator}}{${denominator}}`;
    });

    // Convert exponents and mathematical symbols
    text = text.replace(/\[(.*?)\]\^(\d+|\w+)/g, "[$1]^{$2}");
    text = text.replace(/\((.*?)\)\^(\d+|\w+)/g, "($1)^{$2}");
    text = text.replace(/(\w+)\^(\d+|\w+)/g, "$1^{$2}");
    text = text.replace(/sqrt\((.*?)\)/g, "\\sqrt{$1}");
    text = text.replace(/≥/g, "\\geq");
    text = text.replace(/≤/g, "\\leq");
    text = text.replace(/≠/g, "\\neq");
    text = text.replace(/½/g, "\\frac{1}{2}");
    text = text.replace(/²/g, "^{2}");
    text = text.replace(/³/g, "^{3}");

    // Handle Bangla text with numbers
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

    // Ensure numbers are separated from Bangla text
    text = text.replace(/([০-৯]+)([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ]+)/g, "$1 $2");
    text = text.replace(/([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ]+)([০-৯]+)/g, "$1 $2");

    // Restore placeholders
    text = text.replace(/__PLACEHOLDER_(\d+)__/g, (_, i) => placeholders[i]);

    return text;
  } catch (error) {
    console.error("LaTeX processing error:", error, "Input:", text);
    return text;
  }
};

// Render markdown and LaTeX in preview
const renderLines = (text) => {
  if (!text || typeof text !== "string") {
    return <div className="bangla-text">প্রশ্ন বা উত্তর লিখুন...</div>;
  }

  try {
    return text.split("\n").map((line, index) => {
      // Process markdown
      let processedLine = normalizeText(line);
      const html = marked(processedLine, { breaks: true });
      const sanitizedHtml = DOMPurify.sanitize(html);

      // Check for LaTeX
      const hasLatex = processedLine.match(
        /[\\{}^_]|\\frac|\\sqrt|\\geq|\\leq|\\neq/
      );
      const content = (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      );

      return (
        <div key={index} className="bangla-text">
          {hasLatex ? <MathJax dynamic>{content}</MathJax> : content}
        </div>
      );
    });
  } catch (error) {
    console.error("LaTeX rendering error:", error, "Input:", text);
    return (
      <div className="text-red-500 bangla-text">
        LaTeX ত্রুটি: অসম্পূর্ণ বা ভুল ফরম্যাট। অনুগ্রহ করে সঠিকভাবে লিখুন।
        <div className="text-gray-700 mt-2">{text}</div>
      </div>
    );
  }
};

export default function CreateSQAdmin() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectPapers, setSubjectPapers] = useState([]);
  const [selectedSubjectPaper, setSelectedSubjectPaper] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const contentTypes = [
    "Examples",
    "Model Tests",
    "Admission Questions",
    "Practice Problems",
    "Theory",
    "Others",
  ];
  const [selectedContentType, setSelectedContentType] = useState("");
  const [subChapters, setSubChapters] = useState([]);
  const [selectedSubChapter, setSelectedSubChapter] = useState("");
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
  const [toolbarPosition, setToolbarPosition] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const textareaRefs = useRef({});

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/sq", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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
        setSubjectPapers([]);
        setChapters([]);
        setSelectedSubject("");
        setSelectedSubjectPaper("");
        setSelectedChapterNumber("");
        setSelectedChapterName("");
        setSelectedContentType("");
        setSubChapters([]);
        setSelectedSubChapter("");
        return;
      }

      try {
        const res = await fetch(`/api/sq?classNumber=${selectedClass}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.length > 0) {
          const subjects = [...new Set(data.map((item) => item.subject))];
          const subjectPapers = [
            ...new Set(data.map((item) => item.subjectPart).filter(Boolean)),
          ];
          const chapters = [
            ...new Set(
              data.map((item) => ({
                chapterNumber: item.chapterNumber,
                chapterName: item.chapterName,
                contentType: item.contentType,
                subChapters: item.subChapters || [],
              }))
            ),
          ];
          setSubjects(subjects);
          setSubjectPapers(subjectPapers);
          setChapters(chapters);
        } else {
          setSubjects([]);
          setSubjectPapers([]);
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

  useEffect(() => {
    if (selectedChapterNumber) {
      const selected = chapters.find(
        (chap) => chap.chapterNumber === parseInt(selectedChapterNumber)
      );
      if (selected) {
        setSelectedChapterName(selected.chapterName || "");
        setSelectedContentType(selected.contentType || "");
        setSubChapters(selected.subChapters || []);
        setSelectedSubChapter("");
      }
    }
  }, [selectedChapterNumber, chapters]);

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
    newSQs[index].question = processTextForLatex(value);
    setSQs(newSQs);
  };

  const handleAnswerChange = (index, value) => {
    const newSQs = [...sqs];
    newSQs[index].answer = processTextForLatex(value);
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

  const handleSelection = (index, fieldType, e) => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setActiveField({ index, fieldType });
    } else {
      setActiveField(null);
    }
  };

  const handleFormat = (format, e) => {
    e.preventDefault();
    if (!activeField) return;
    const { index, fieldType } = activeField;
    const newSQs = [...sqs];
    const textarea = textareaRefs.current[`${fieldType}-${index}`];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText =
      fieldType === "question" ? newSQs[index].question : newSQs[index].answer;
    const selectedText = currentText.substring(start, end);
    if (!selectedText) return;

    let formattedText = selectedText;
    let offset = 0;
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`;
        offset = 2;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        offset = 1;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        offset = 2;
        break;
      case "math":
        formattedText = `$${selectedText}$`;
        offset = 1;
        break;
    }

    const updatedText =
      currentText.substring(0, start) +
      formattedText +
      currentText.substring(end);
    if (fieldType === "question") {
      newSQs[index].question = updatedText;
    } else {
      newSQs[index].answer = updatedText;
    }
    setSQs(newSQs);
    setToolbarPosition(null);
    setActiveField(null);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + offset;
      textarea.selectionEnd = start + formattedText.length - offset;
    }, 0);
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        Class: "",
        Subject: "",
        "Subject Paper": "",
        "Chapter Number": "",
        "Chapter Name": "",
        "Content Type": "",
        "Sub Chapter": "",
        Type: "",
        Question: "",
        Answer: "",
        "Image Alignment": "center",
        "Video Link": "",
      },
      {
        Class: 9,
        Subject: "General Science",
        "Subject Paper": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "Content Type": "Theory",
        "Sub Chapter": "Exercise 1.1",
        Type: "জ্ঞানমূলক",
        Question: "প্রাথমিক শক্তির উৎস কী?",
        Answer: "সূর্য।",
        "Image Alignment": "center",
        "Video Link": "https://drive.google.com/file/d/example",
      },
      {
        Class: 9,
        Subject: "General Science",
        "Subject Paper": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "Content Type": "Practice Problems",
        "Sub Chapter": "",
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
            question: processTextForLatex(normalizeText(row.Question || "")),
            answer: processTextForLatex(normalizeText(row.Answer || "")),
            classLevel: row.Class || selectedClass,
            subjectName: row.Subject || selectedSubject,
            subjectPaper: row["Subject Paper"] || selectedSubjectPaper,
            chapterNumber: row["Chapter Number"] || selectedChapterNumber,
            chapterName: row["Chapter Name"] || selectedChapterName,
            contentType: row["Content Type"] || selectedContentType,
            subChapters: row["Sub Chapter"] ? [row["Sub Chapter"]] : [],
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));
          const response = await fetch("/api/sq/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
          });
          if (response.ok) {
            toast.success("✅ প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
          } else {
            const errorData = await response.json();
            console.error("Import error:", errorData);
            toast.error(
              `❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ: ${
                errorData.error || "Unknown error"
              }`
            );
          }
        } else {
          toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
        }
      } catch (error) {
        console.error("File processing error:", error);
        toast.error("❌ ফাইল প্রসেসিংয়ে ত্রুটি!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const resetForm = () => {
    setSelectedClass("");
    setSubjects([]);
    setSelectedSubject("");
    setSubjectPapers([]);
    setSelectedSubjectPaper("");
    setChapters([]);
    setSelectedChapterNumber("");
    setSelectedChapterName("");
    setSelectedContentType("");
    setSubChapters([]);
    setSelectedSubChapter("");
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
    if (
      !selectedClass ||
      !selectedSubject ||
      !selectedChapterNumber ||
      !selectedContentType
    ) {
      toast.error("❌ অনুগ্রহ করে সকল প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }
    const formData = new FormData();
    formData.append("classLevel", selectedClass);
    formData.append("subjectName", selectedSubject);
    formData.append("subjectPaper", selectedSubjectPaper || "");
    formData.append("chapterNumber", selectedChapterNumber);
    formData.append("chapterName", selectedChapterName);
    formData.append("contentType", selectedContentType);
    formData.append(
      "subChapters",
      JSON.stringify(selectedSubChapter ? [selectedSubChapter] : [])
    );
    formData.append("teacherEmail", "admin");
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
        toast.success(
          `✅ ${sqs.length}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!`
        );
        resetForm();
      } else {
        console.error("Submit error:", responseData);
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
      }
    } catch (error) {
      console.error("Server connection error:", error);
      toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!");
    }
  };

  return (
    <>
      <Head>
        <meta
          http-equiv="Content-Security-Policy"
          content="script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net;"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Kalpurush&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              MathJax = {
                tex: {
                  inlineMath: [['$', '$'], ['\\(', '\\)']],
                  displayMath: [['$$', '$$'], ['\\[', '\\]']],
                  tags: 'ams',
                  processEscapes: true,
                },
                chtml: {
                  scale: 1.1,
                  mtextInheritFont: true,
                },
                startup: {
                  ready: () => {
                    MathJax.startup.defaultReady();
                    MathJax.startup.promise.then(() => {
                      window.dispatchEvent(new Event('mathjax-ready'));
                    });
                  }
                }
              };
            `,
          }}
        />
        <script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          async
        ></script>
      </Head>
      <style jsx global>{`
        .bangla-text {
          font-family: "Kalpurush", "Noto Sans Bengali", sans-serif !important;
          direction: ltr;
          unicode-bidi: embed;
        }
        textarea.bangla-text {
          min-height: 80px !important;
          height: auto !important;
          overflow-y: auto !important;
          max-height: 250px !important;
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          padding: 12px !important;
          box-sizing: border-box !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea.bangla-text:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }
        .MathJax .mtext {
          font-family: "Kalpurush", "Noto Sans Bengali", sans-serif !important;
          white-space: pre-wrap !important;
          margin-right: 0.25em !important;
          margin-left: 0.25em !important;
        }
        .form-section {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-bottom: 2rem;
        }
        select,
        input[type="file"] {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        select:focus,
        input[type="file"]:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 সংক্ষিপ্ত প্রশ্ন তৈরি
        </motion.h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="form-section">
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
                  📥 এক্সেল টেমপ্লেট ডাউনলোড
                </motion.button>
              </div>
              <p className="text-center text-gray-500 mb-4 bangla-text">অথবা</p>
              <div className="form-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      ক্লাস <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        বিষয় <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    </div>
                  )}
                </div>
                {selectedSubject && subjectPapers.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      বিষয়ের পেপার
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedSubjectPaper}
                      onChange={(e) => setSelectedSubjectPaper(e.target.value)}
                    >
                      <option value="">পেপার নির্বাচন করুন (যদি থাকে)</option>
                      {subjectPapers.map((paper) => (
                        <option key={paper} value={paper}>
                          {paper}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedSubject && chapters.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      অধ্যায় <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedChapterNumber}
                      onChange={(e) => {
                        const selected = chapters.find(
                          (chap) =>
                            chap.chapterNumber === parseInt(e.target.value)
                        );
                        setSelectedChapterNumber(e.target.value);
                        setSelectedChapterName(selected?.chapterName || "");
                        setSelectedContentType(selected?.contentType || "");
                        setSubChapters(selected?.subChapters || []);
                        setSelectedSubChapter("");
                      }}
                      required
                    >
                      <option value="">অধ্যায় নির্বাচন করুন</option>
                      {chapters.map((chapter) => (
                        <option
                          key={chapter.chapterNumber}
                          value={chapter.chapterNumber}
                        >
                          অধ্যায় {chapter.chapterNumber} -{" "}
                          {chapter.chapterName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedChapterNumber && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      কন্টেন্ট টাইপ <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value)}
                      required
                    >
                      <option value="">কন্টেন্ট টাইপ নির্বাচন করুন</option>
                      {contentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "Examples"
                            ? "উদাহরণ"
                            : type === "Model Tests"
                            ? "মডেল টেস্ট"
                            : type === "Admission Questions"
                            ? "ভর্তি প্রশ্ন"
                            : type === "Practice Problems"
                            ? "অভ্যাস সমস্যা"
                            : type === "Theory"
                            ? "তত্ত্ব"
                            : "অন্যান্য"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedChapterNumber && subChapters.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      উপ-অধ্যায় / অনুশীলন (ঐচ্ছিক)
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedSubChapter}
                      onChange={(e) => setSelectedSubChapter(e.target.value)}
                    >
                      <option value="">উপ-অধ্যায় নির্বাচন করুন</option>
                      {subChapters.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="form-section">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultipleSQs}
                    onChange={(e) => setIsMultipleSQs(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
                    একাধিক সংক্ষিপ্ত প্রশ্ন যোগ করুন
                  </label>
                </div>
                {sqs.map((sq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                      সংক্ষিপ্ত প্রশ্ন {index + 1}
                    </h3>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        প্রশ্নের ধরণ <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                        value={sq.type}
                        onChange={(e) =>
                          handleTypeChange(index, e.target.value)
                        }
                        required
                      >
                        <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                        <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                        <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                        <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                      </select>
                    </div>
                    <div className="mt-4 relative">
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        প্রশ্ন লিখুন <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="w-full p-4 border rounded-lg bangla-text"
                        value={sq.question}
                        onChange={(e) =>
                          handleQuestionChange(index, e.target.value)
                        }
                        onMouseUp={(e) => handleSelection(index, "question", e)}
                        onKeyUp={(e) => handleSelection(index, "question", e)}
                        rows={4}
                        ref={(el) =>
                          (textareaRefs.current[`question-${index}`] = el)
                        }
                        required
                        aria-label={`প্রশ্ন ${index + 1}`}
                      />
                      <div
                        className="absolute bottom-full left-0"
                        style={{ zIndex: 100 }}
                      >
                        {" "}
                        {/* Adjusted positioning */}
                        <FormatToolbar
                          onFormat={handleFormat}
                          isVisible={
                            activeField?.index === index &&
                            activeField?.fieldType === "question"
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}
                        {2})
                      </p>
                    </div>

                    <div className="mt-4 relative">
                      <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                        উত্তর লিখুন (ঐচ্ছিক)
                      </label>
                      <textarea
                        className="w-full p-4 border rounded-lg bangla-text"
                        value={sq.answer}
                        onChange={(e) =>
                          handleAnswerChange(index, e.target.value)
                        }
                        onMouseUp={(e) => handleSelection(index, "answer", e)}
                        onKeyUp={(e) => handleSelection(index, "answer", e)}
                        rows={4}
                        ref={(el) =>
                          (textareaRefs.current[`answer-${index}`] = el)
                        }
                        aria-label={`উত্তর ${index + 1}`}
                      />
                      <div
                        className="absolute bottom-full left-0"
                        style={{ zIndex: 100 }}
                      >
                        {" "}
                        {/* Adjusted positioning */}
                        <FormatToolbar
                          onFormat={handleFormat}
                          isVisible={
                            activeField?.index === index &&
                            activeField?.fieldType === "answer"
                          }
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1 bangla-text">
                        * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}
                        {2})
                      </p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ভিডিও লিঙ্ক (ঐচ্ছিক)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                        value={sq.videoLink}
                        onChange={(e) =>
                          handleVideoLinkChange(index, e.target.value)
                        }
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবি যুক্ত করুন (ঐচ্ছিক)
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(index, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <p className="text-center text-gray-500 bangla-text">
                          {sq.image
                            ? sq.image.name
                            : "ছবি টেনে আনুন বা ক্লিক করুন"}
                        </p>
                      </div>
                    </div>
                    {sq.image && (
                      <div className="mt-4">
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          ছবির অ্যালাইনমেন্ট
                        </label>
                        <select
                          value={sq.imageAlignment}
                          onChange={(e) =>
                            handleImageAlignmentChange(index, e.target.value)
                          }
                          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md bangla-text"
                  >
                    <span className="text-xl mr-2">+</span> নতুন প্রশ্ন যোগ করুন
                  </motion.button>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg hover:bg-blue-700 transition shadow-md bangla-text"
              >
                ✅ সাবমিট করুন
              </motion.button>
            </form>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-blue-700 mb-6 bangla-text">
              প্রিভিউ
            </h2>
            {sqs.map((sq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-3 bangla-text">
                  প্রশ্ন {index + 1}
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                  ধরণ: {sq.type}
                </p>
                <div className="text-gray-700 mb-4 bangla-text">
                  {renderLines(sq.question)}
                </div>
                {sq.videoLink && (
                  <div className="mb-4">
                    <a
                      href={sq.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 bangla-text"
                    >
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}
                {sq.image && (
                  <div
                    className={`mb-4 ${
                      sq.imageAlignment === "left"
                        ? "text-left"
                        : sq.imageAlignment === "right"
                        ? "text-right"
                        : "text-center"
                    }`}
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
                    <div className="bangla-text">{renderLines(sq.answer)}</div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়:{" "}
                  {selectedSubject || "N/A"} | পেপার:{" "}
                  {selectedSubjectPaper || "N/A"} | অধ্যায়:{" "}
                  {selectedChapterName || "N/A"} | কন্টেন্ট:{" "}
                  {selectedContentType || "N/A"} | উপ-অধ্যায়:{" "}
                  {selectedSubChapter || "N/A"}
                </p>
              </motion.div>
            ))}
            {sqs.length === 0 && (
              <p className="text-gray-500 text-center text-lg bangla-text">
                প্রিভিউ দেখতে প্রশ্ন যোগ করুন
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
