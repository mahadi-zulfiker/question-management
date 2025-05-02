"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { Loader2 } from "lucide-react";
import FormatToolbar from "../../../FormatToolbar/index";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Dynamically import MathJax to avoid SSR issues
const MathJax = dynamic(() => import("better-react-mathjax").then((mod) => mod.MathJax), {
  ssr: false,
});

// Normalize text to Unicode NFC and remove problematic characters
const normalizeText = (text) => {
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
      const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
      return `${whole}\\ \\frac{${numerator}}{${denominator}}`;
    });
    text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
      if (denom === "0") return match;
      const { numerator, denominator } = simplifyFraction(parseInt(num), parseInt(denom));
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
    return <div className="bangla-text">প্রশ্ন বা বিকল্প লিখুন...</div>;
  }

  try {
    return text.split("\n").map((line, index) => {
      // Process markdown
      let processedLine = normalizeText(line);
      const html = marked(processedLine, { breaks: true });
      const sanitizedHtml = DOMPurify.sanitize(html);

      // Check for LaTeX
      const hasLatex = processedLine.match(/[\\{}^_]|\\frac|\\sqrt|\\geq|\\leq|\\neq/);
      const content = <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;

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

export default function CreateMCQAdmin() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectPapers, setSubjectPapers] = useState([]);
  const [selectedSubjectPaper, setSelectedSubjectPaper] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const contentTypes = ["Examples", "Model Tests", "Admission Questions", "Practice Problems", "Theory", "Others"];
  const [selectedContentType, setSelectedContentType] = useState("");
  const [subChapters, setSubChapters] = useState([]);
  const [selectedSubChapter, setSelectedSubChapter] = useState("");
  const [questionType, setQuestionType] = useState("general");
  const [isMultipleQuestions, setIsMultipleQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [activeField, setActiveField] = useState(null);
  const textareaRefs = useRef({});

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/mcq", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        toast.error("❌ ক্লাস লোড করতে ব্যর্থ");
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
        setSelectedChapter("");
        setSelectedChapterName("");
        setSelectedContentType("");
        setSubChapters([]);
        setSelectedSubChapter("");
        return;
      }

      try {
        const res = await fetch(`/api/mcq?classNumber=${selectedClass}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.length > 0) {
          setSubjects([...new Set(data.map((item) => item.subject))]);
          setSubjectPapers([...new Set(data.map((item) => item.subjectPart).filter((part) => part))]);
          const chapterMap = new Map();
          data.forEach((item) => {
            const key = `${item.chapterNumber}-${item.chapterName}`;
            if (!chapterMap.has(key))
              chapterMap.set(key, {
                number: item.chapterNumber,
                name: item.chapterName,
                contentType: item.contentType,
                subChapters: item.subChapters || [],
              });
          });
          setChapters(Array.from(chapterMap.values()));
        } else {
          setSubjects([]);
          setSubjectPapers([]);
          setChapters([]);
          toast.info("⚠️ এই ক্লাসের জন্য কোনো ডেটা নেই।");
        }
      } catch (error) {
        console.error("Error fetching class data:", error);
        toast.error("❌ ক্লাস ডেটা লোড করতে ব্যর্থ");
      }
    }
    fetchClassData();
  }, [selectedClass]);

  useEffect(() => {
    if (selectedChapter) {
      const selected = chapters.find((chap) => chap.number === parseInt(selectedChapter));
      if (selected) {
        setSelectedChapterName(selected.name || "");
        setSelectedContentType(selected.contentType || "");
        setSubChapters(selected.subChapters || []);
        setSelectedSubChapter("");
      }
    }
  }, [selectedChapter, chapters]);

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
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) {
      setToolbarPosition(null);
      setActiveField(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (selection.toString().length > 0) {
      setToolbarPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40,
      });
      setActiveField({ qIndex, fieldType, oIndex });
    } else {
      setToolbarPosition(null);
      setActiveField(null);
    }
  };

  const handleFormat = (format, e) => {
    e.preventDefault();
    if (!activeField) return;

    const { qIndex, fieldType, oIndex } = activeField;
    const newQuestions = [...questions];
    const textarea = textareaRefs.current[`${fieldType}-${qIndex}-${oIndex ?? ''}`];
    if (!textarea) return;

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
      case "bold":
        formattedText = `**${selectedText}**`;
        break;
      case "italic":
        formattedText = `*${selectedText}*`;
        break;
      case "underline":
        formattedText = `__${selectedText}__`;
        break;
      case "math":
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
        "Subject Paper": "",
        "Chapter Number": "",
        "Chapter Name": "",
        "Content Type": "",
        "Sub Chapter": "",
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
        "Subject Paper": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "Content Type": "Theory",
        "Sub Chapter": "Exercise 1.1",
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
        "Content Type": "Practice Problems",
        "Sub Chapter": "",
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
            subjectPaper: row["Subject Paper"] || selectedSubjectPaper,
            chapterNumber: row["Chapter Number"] || selectedChapter,
            chapterName: row["Chapter Name"] || selectedChapterName,
            contentType: row["Content Type"] || selectedContentType,
            subChapters: row["Sub Chapter"] ? [row["Sub Chapter"]] : [],
            questionType: row["MCQ Type"] || questionType,
            options:
              row["MCQ Type"] === "general" || !row["MCQ Type"]
                ? [
                    processTextForLatex(normalizeText(row["Option 1"] || "")),
                    processTextForLatex(normalizeText(row["Option 2"] || "")),
                    processTextForLatex(normalizeText(row["Option 3"] || "")),
                    processTextForLatex(normalizeText(row["Option 4"] || "")),
                  ]
                : [
                    processTextForLatex(normalizeText(row["Option 1"] || "")),
                    processTextForLatex(normalizeText(row["Option 2"] || "")),
                    processTextForLatex(normalizeText(row["Option 3"] || "")),
                    processTextForLatex(normalizeText(row["Option 4"] || "")),
                    processTextForLatex(normalizeText(row["Option 5"] || "")),
                    processTextForLatex(normalizeText(row["Option 6"] || "")),
                    processTextForLatex(normalizeText(row["Option 7"] || "")),
                  ],
            correctAnswer: row["Correct Answer"] || null,
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/mcq/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
          });

          if (response.ok) {
            toast.success("✅ প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
          } else {
            const errorData = await response.json();
            console.error("Import error:", errorData);
            toast.error(`❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ: ${errorData.error || "Unknown error"}`);
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
    setSelectedChapter("");
    setSelectedChapterName("");
    setSelectedContentType("");
    setSubChapters([]);
    setSelectedSubChapter("");
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

    if (!selectedClass || !selectedSubject || !selectedChapter || !questionType || !selectedContentType) {
      toast.error("❌ অনুগ্রহ করে সকল প্রয়োজনীয় ফিল্ড পূরণ করুন!");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("classNumber", selectedClass);
    formData.append("subject", selectedSubject);
    formData.append("subjectPaper", selectedSubjectPaper || "");
    formData.append("chapterNumber", selectedChapter);
    formData.append("chapterName", selectedChapterName);
    formData.append("contentType", selectedContentType);
    formData.append("subChapters", JSON.stringify(selectedSubChapter ? [selectedSubChapter] : []));
    formData.append("questionType", questionType);
    formData.append("teacherEmail", "admin");

    questions.forEach((q, index) => {
      formData.append(`questions[${index}][question]`, q.question);
      formData.append(
        `questions[${index}][options]`,
        JSON.stringify(questionType === "general" ? q.options : q.higherOptions)
      );
      formData.append(
        `questions[${index}][correctAnswer]`,
        questionType === "general" ? q.correctAnswer : q.higherCorrectAnswer
      );
      if (q.image) formData.append(`questions[${index}][image]`, q.image);
      formData.append(`questions[${index}][imageAlignment]`, q.imageAlignment);
      formData.append(`questions[${index}][videoLink]`, q.videoLink || "");
    });

    try {
      const response = await fetch("/api/mcq/import", { method: "POST", body: formData });
      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${questions.length}টি এমসিকিউ সফলভাবে যোগ করা হয়েছে!`);
        resetForm();
      } else {
        console.error("Submit error:", responseData);
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
      }
    } catch (error) {
      console.error("Server connection error:", error);
      toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' https://cdn.jsdelivr.net; connect-src 'self' https://cdn.jsdelivr.net;" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalpurush&display=swap" rel="stylesheet" />
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
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
      </Head>
      <style jsx global>{`
        .bangla-text {
          font-family: "Kalpurush", "Noto Sans Bengali", sans-serif !important;
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
        .form-section {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin-bottom: 2rem;
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
        select, input[type="file"] {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        select:focus, input[type="file"]:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3) !important;
        }
        .MathJax .mtext {
          font-family: "Kalpurush", "Noto Sans Bengali", sans-serif !important;
          white-space: pre-wrap !important;
          margin-right: 0.25em !important;
          margin-left: 0.25em !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-10 bangla-text"
        >
          📝 এমসিকিউ তৈরি করুন
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <label className="block text-gray-700 font-semibold mb-2 bangla-text">
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

              <div className="form-section">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      ক্লাস <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                </div>
                {selectedSubject && subjectPapers.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      বিষয়ের পেপার
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={selectedSubjectPaper}
                      onChange={(e) => setSelectedSubjectPaper(e.target.value)}
                    >
                      <option value="">পেপার নির্বাচন করুন (যদি থাকে)</option>
                      {subjectPapers.map((paper) => (
                        <option key={paper} value={paper}>{paper}</option>
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
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={selectedChapter}
                      onChange={(e) => {
                        const selected = chapters.find((chap) => chap.number === parseInt(e.target.value));
                        setSelectedChapter(e.target.value);
                        setSelectedChapterName(selected?.name || "");
                        setSelectedContentType(selected?.contentType || "");
                        setSubChapters(selected?.subChapters || []);
                        setSelectedSubChapter("");
                      }}
                      required
                    >
                      <option value="">অধ্যায় নির্বাচন করুন</option>
                      {chapters.map((chapter) => (
                        <option key={`${chapter.number}-${chapter.name}`} value={chapter.number}>
                          অধ্যায় {chapter.number} - {chapter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedChapter && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      কন্টেন্ট টাইপ <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={selectedContentType}
                      onChange={(e) => setSelectedContentType(e.target.value)}
                      required
                    >
                      <option value="">কন্টেন্ট টাইপ নির্বাচন করুন</option>
                      {contentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "Examples" ? "উদাহরণ" :
                           type === "Model Tests" ? "মডেল টেস্ট" :
                           type === "Admission Questions" ? "ভর্তি প্রশ্ন" :
                           type === "Practice Problems" ? "অভ্যাস সমস্যা" :
                           type === "Theory" ? "তত্ত্ব" : "অন্যান্য"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedChapter && subChapters.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      উপ-অধ্যায় / অনুশীলন (ঐচ্ছিক)
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={selectedSubChapter}
                      onChange={(e) => setSelectedSubChapter(e.target.value)}
                    >
                      <option value="">উপ-অধ্যায় নির্বাচন করুন</option>
                      {subChapters.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mt-4">
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                    প্রশ্নের ধরণ <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    required
                  >
                    <option value="general">সাধারণ এমসিকিউ</option>
                    <option value="higher">উচ্চতর দক্ষতা এমসিকিউ</option>
                  </select>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultipleQuestions}
                    onChange={(e) => setIsMultipleQuestions(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 text-gray-700 font-semibold text-lg bangla-text">
                    একাধিক প্রশ্ন যোগ করুন
                  </label>
                </div>
              </div>

              {questions.map((q, qIndex) => (
                <motion.div
                  key={qIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 bangla-text">
                    প্রশ্ন {qIndex + 1}
                  </h3>
                  <div className="mb-4 relative">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      প্রশ্ন লিখুন <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-4 border rounded-lg bangla-text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                      onMouseUp={(e) => handleSelection(qIndex, "question", null, e)}
                      onKeyUp={(e) => handleSelection(qIndex, "question", null, e)}
                      rows={4}
                      placeholder="🔹 প্রশ্ন লিখুন"
                      ref={(el) => (textareaRefs.current[`question-${qIndex}-`] = el)}
                      required
                    />
                    <FormatToolbar
                      position={
                        toolbarPosition && activeField?.qIndex === qIndex && activeField?.fieldType === "question"
                          ? toolbarPosition
                          : null
                      }
                      onFormat={handleFormat}
                    />
                    <p className="text-sm text-gray-500 mt-1 bangla-text">
                      * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={q.videoLink}
                      onChange={(e) => handleVideoLinkChange(qIndex, e.target.value)}
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
                        onChange={(e) => handleImageChange(qIndex, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 text-lg bangla-text">
                        {q.image ? q.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {q.image && (
                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={q.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(qIndex, e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                        <div key={i} className="flex items-center mb-4 relative">
                          <div className="flex-1 relative">
                            <textarea
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, i, e.target.value)}
                              onMouseUp={(e) => handleSelection(qIndex, "option", i, e)}
                              onKeyUp={(e) => handleSelection(qIndex, "option", i, e)}
                              rows={2}
                              placeholder={`বিকল্প ${i + 1} লিখুন`}
                              ref={(el) => (textareaRefs.current[`option-${qIndex}-${i}`] = el)}
                              required
                            />
                            <FormatToolbar
                              position={
                                toolbarPosition &&
                                activeField?.qIndex === qIndex &&
                                activeField?.fieldType === "option" &&
                                activeField?.oIndex === i
                                  ? toolbarPosition
                                  : null
                              }
                              onFormat={handleFormat}
                            />
                          </div>
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            className="ml-4 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            onChange={() => handleCorrectAnswerChange(qIndex, i)}
                            checked={q.correctAnswer === i}
                            required
                          />
                        </div>
                      ))}
                      <p className="text-sm text-gray-500 mt-2 bangla-text">
                        * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                      </p>
                    </>
                  )}

                  {questionType === "higher" && (
                    <>
                      {q.higherOptions.slice(0, 3).map((option, i) => (
                        <div key={i} className="mb-4 relative">
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, i, e.target.value, "higher")}
                            onMouseUp={(e) => handleSelection(qIndex, "option", i, e)}
                            onKeyUp={(e) => handleSelection(qIndex, "option", i, e)}
                            rows={2}
                            placeholder={`বিকল্প ${i + 1} লিখুন`}
                            ref={(el) => (textareaRefs.current[`option-${qIndex}-${i}`] = el)}
                            required
                          />
                          <FormatToolbar
                            position={
                              toolbarPosition &&
                              activeField?.qIndex === qIndex &&
                              activeField?.fieldType === "option" &&
                              activeField?.oIndex === i
                                ? toolbarPosition
                                : null
                            }
                            onFormat={handleFormat}
                          />
                        </div>
                      ))}
                      <h3 className="mt-4 mb-3 text-lg font-semibold text-gray-700 bangla-text">
                        নিচের কোনটি সঠিক?
                      </h3>
                      {q.higherOptions.slice(3, 7).map((option, i) => (
                        <div key={i + 3} className="flex items-center mb-4 relative">
                          <div className="flex-1 relative">
                            <textarea
                              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, i + 3, e.target.value, "higher")}
                              onMouseUp={(e) => handleSelection(qIndex, "option", i + 3, e)}
                              onKeyUp={(e) => handleSelection(qIndex, "option", i + 3, e)}
                              rows={2}
                              placeholder={`বিকল্প ${i + 4} লিখুন`}
                              ref={(el) => (textareaRefs.current[`option-${qIndex}-${i + 3}`] = el)}
                              required
                            />
                            <FormatToolbar
                              position={
                                toolbarPosition &&
                                activeField?.qIndex === qIndex &&
                                activeField?.fieldType === "option" &&
                                activeField?.oIndex === i + 3
                                  ? toolbarPosition
                                  : null
                              }
                              onFormat={handleFormat}
                            />
                          </div>
                          <input
                            type="radio"
                            name={`higherCorrect-${qIndex}`}
                            className="ml-4 h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                            onChange={() => handleCorrectAnswerChange(qIndex, i + 3, "higher")}
                            checked={q.higherCorrectAnswer === i + 3}
                            required
                          />
                        </div>
                      ))}
                      <p className="text-sm text-gray-500 mt-2 bangla-text">
                        * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
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
                  className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 transition shadow-md text-lg bangla-text flex items-center justify-center"
                >
                  <span className="text-xl mr-2">+</span> নতুন প্রশ্ন যোগ করুন
                </motion.button>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-3 mt-8 rounded-lg hover:bg-blue-700 transition shadow-md text-lg bangla-text flex items-center justify-center ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2 text-white" />
                    সাবমিট হচ্ছে...
                  </>
                ) : (
                  "✅ সাবমিট করুন"
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
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
                    <a
                      href={q.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link bangla-text"
                    >
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
                        {String.fromCharCode(2453 + i)}. {renderLines(opt || "বিকল্প লিখুন...")}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 text-gray-700">
                      {q.higherOptions.slice(0, 3).map((opt, i) => (
                        <p key={i} className="bangla-text">
                          {String.fromCharCode(2453 + i)}. {renderLines(opt || "বিকল্প লিখুন...")}
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
                          {String.fromCharCode(2453 + i)}. {renderLines(opt || "বিকল্প লিখুন...")}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | পেপার: {selectedSubjectPaper || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"} | কন্টেন্ট: {selectedContentType || "N/A"} | উপ-অধ্যায়: {selectedSubChapter || "N/A"} | ধরণ: {questionType}
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