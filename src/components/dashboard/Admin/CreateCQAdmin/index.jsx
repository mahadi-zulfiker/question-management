"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { Loader2 } from "lucide-react";
import FormatToolbar from "@/components/FormatToolbar";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Dynamically import MathJax to avoid SSR issues
const MathJax = dynamic(() => import("better-react-mathjax").then((mod) => mod.MathJax), {
  ssr: false,
});

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
    return <div className="bangla-text">টেক্সট লিখুন</div>;
  }

  try {
    return text.split("\n").map((line, index) => {
      let processedLine = normalizeText(line);
      const html = marked(processedLine, { breaks: true });
      const sanitizedHtml = DOMPurify.sanitize(html);

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

export default function CreateCQAdmin() {
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
  const [cqType, setCQType] = useState("");
  const [isMultipleCQs, setIsMultipleCQs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cqs, setCQs] = useState([
    {
      passage: "",
      questions: ["", "", "", ""],
      answers: ["", "", "", ""],
      latexQuestions: ["", "", ""],
      latexAnswers: ["", "", ""],
      image: null,
      imageAlignment: "center",
      videoLink: "",
    },
  ]);
  const [activeField, setActiveField] = useState(null);
  const textareaRefs = useRef({});

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/cq", { cache: "no-store" });
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
        const res = await fetch(`/api/cq?classNumber=${selectedClass}`, { cache: "no-store" });
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
        setActiveField(null);
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

  const addNewCQ = () => {
    setCQs([
      ...cqs,
      {
        passage: "",
        questions: ["", "", "", ""],
        answers: ["", "", "", ""],
        latexQuestions: ["", "", ""],
        latexAnswers: ["", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handlePassageChange = (cqIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].passage = processTextForLatex(value);
    setCQs(newCQs);
  };

  const handleQuestionChange = (cqIndex, qIndex, value, type = "generalCQ") => {
    const newCQs = [...cqs];
    if (type === "generalCQ") {
      newCQs[cqIndex].questions[qIndex] = processTextForLatex(value);
    } else {
      newCQs[cqIndex].latexQuestions[qIndex] = processTextForLatex(value);
    }
    setCQs(newCQs);
  };

  const handleAnswerChange = (cqIndex, qIndex, value, type = "generalCQ") => {
    const newCQs = [...cqs];
    if (type === "generalCQ") {
      newCQs[cqIndex].answers[qIndex] = processTextForLatex(value);
    } else {
      newCQs[cqIndex].latexAnswers[qIndex] = processTextForLatex(value);
    }
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

  const handleVideoLinkChange = (cqIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].videoLink = value;
    setCQs(newCQs);
  };

  const handleSelection = (cqIndex, fieldType, index, e) => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setActiveField({ cqIndex, fieldType, index });
    } else {
      setActiveField(null);
    }
  };

  const handleFormat = (format, e) => {
    e.preventDefault();
    if (!activeField) return;

    const { cqIndex, fieldType, index } = activeField;
    const newCQs = [...cqs];
    const textarea = textareaRefs.current[`${fieldType}-${cqIndex}-${index ?? ''}`];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let currentText;
    if (fieldType === "passage") {
      currentText = newCQs[cqIndex].passage;
    } else if (fieldType === "question") {
      currentText = cqType === "generalCQ"
        ? newCQs[cqIndex].questions[index]
        : newCQs[cqIndex].latexQuestions[index];
    } else if (fieldType === "answer") {
      currentText = cqType === "generalCQ"
        ? newCQs[cqIndex].answers[index]
        : newCQs[cqIndex].latexAnswers[index];
    }

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

    const updatedText = currentText.substring(0, start) + formattedText + currentText.substring(end);
    if (fieldType === "passage") {
      newCQs[cqIndex].passage = updatedText;
    } else if (fieldType === "question") {
      if (cqType === "generalCQ") {
        newCQs[cqIndex].questions[index] = updatedText;
      } else {
        newCQs[cqIndex].latexQuestions[index] = updatedText;
      }
    } else if (fieldType === "answer") {
      if (cqType === "generalCQ") {
        newCQs[cqIndex].answers[index] = updatedText;
      } else {
        newCQs[cqIndex].latexAnswers[index] = updatedText;
      }
    }

    setCQs(newCQs);
    setActiveField(null);

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
        "CQ Type": "",
        Passage: "",
        "Knowledge Question": "",
        "Knowledge Answer": "",
        "Comprehension Question": "",
        "Comprehension Answer": "",
        "Application Question": "",
        "Application Answer": "",
        "Higher Skills Question": "",
        "Higher Skills Answer": "",
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
        "Sub Chapter": "Section 1.1",
        "CQ Type": "generalCQ",
        Passage: "This is a sample passage for a general CQ.",
        "Knowledge Question": "What is the primary source of energy?",
        "Knowledge Answer": "The Sun.",
        "Comprehension Question": "Explain how energy is transferred.",
        "Comprehension Answer": "Energy is transferred through radiation.",
        "Application Question": "How can we use solar energy in daily life?",
        "Application Answer": "By using solar panels to generate electricity.",
        "Higher Skills Question": "Evaluate the impact of solar energy on the environment.",
        "Higher Skills Answer": "Solar energy reduces carbon emissions.",
        "Image Alignment": "center",
        "Video Link": "https://drive.google.com/file/d/example",
      },
      {
        Class: 9,
        Subject: "General Math",
        "Subject Paper": "",
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
        "Content Type": "Practice Problems",
        "Sub Chapter": "",
        "CQ Type": "mathCQ",
        Passage: "\\frac{1}{2} + \\frac{1}{3} = ?",
        "Knowledge Question": "Simplify the expression.",
        "Knowledge Answer": "\\frac{5}{6}",
        "Comprehension Question": "",
        "Comprehension Answer": "",
        "Application Question": "Apply this to a real-world problem.",
        "Application Answer": "\\frac{5}{6} of a total amount.",
        "Higher Skills Question": "Derive a general formula.",
        "Higher Skills Answer": "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
        "Image Alignment": "center",
        "Video Link": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CQ Template");
    XLSX.writeFile(wb, "CQ_Upload_Template.xlsx");
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
            passage: processTextForLatex(normalizeText(row.Passage || "")),
            classNumber: row.Class || selectedClass,
            subject: row.Subject || selectedSubject,
            subjectPaper: row["Subject Paper"] || selectedSubjectPaper,
            chapterNumber: row["Chapter Number"] || selectedChapter,
            chapterName: row["Chapter Name"] || selectedChapterName,
            contentType: row["Content Type"] || selectedContentType,
            subChapters: row["Sub Chapter"] ? [row["Sub Chapter"]] : [],
            cqType: row["CQ Type"] || cqType,
            questions:
              row["CQ Type"] === "generalCQ"
                ? [
                    processTextForLatex(normalizeText(row["Knowledge Question"] || "")),
                    processTextForLatex(normalizeText(row["Comprehension Question"] || "")),
                    processTextForLatex(normalizeText(row["Application Question"] || "")),
                    processTextForLatex(normalizeText(row["Higher Skills Question"] || "")),
                  ]
                : [
                    processTextForLatex(normalizeText(row["Knowledge Question"] || "")),
                    processTextForLatex(normalizeText(row["Application Question"] || "")),
                    processTextForLatex(normalizeText(row["Higher Skills Question"] || "")),
                  ],
            answers:
              row["CQ Type"] === "generalCQ"
                ? [
                    processTextForLatex(normalizeText(row["Knowledge Answer"] || "")),
                    processTextForLatex(normalizeText(row["Comprehension Answer"] || "")),
                    processTextForLatex(normalizeText(row["Application Answer"] || "")),
                    processTextForLatex(normalizeText(row["Higher Skills Answer"] || "")),
                  ]
                : [
                    processTextForLatex(normalizeText(row["Knowledge Answer"] || "")),
                    processTextForLatex(normalizeText(row["Application Answer"] || "")),
                    processTextForLatex(normalizeText(row["Higher Skills Answer"] || "")),
                  ],
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/cq/import", {
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
    setCQType("");
    setIsMultipleCQs(false);
    setCQs([
      {
        passage: "",
        questions: ["", "", "", ""],
        answers: ["", "", "", ""],
        latexQuestions: ["", "", ""],
        latexAnswers: ["", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
    setActiveField(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClass || !selectedSubject || !selectedChapter || !cqType || !selectedContentType) {
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
    formData.append("cqType", cqType);
    formData.append("teacherEmail", "admin");

    cqs.forEach((cq, index) => {
      const passageText = cq.passage || "";
      const questionsText = cqType === "generalCQ" ? cq.questions : cq.latexQuestions;
      const answersText = cqType === "generalCQ" ? cq.answers : cq.latexAnswers;

      formData.append(`cqs[${index}][passage]`, passageText);
      formData.append(`cqs[${index}][questions]`, JSON.stringify(questionsText));
      formData.append(`cqs[${index}][answers]`, JSON.stringify(answersText));
      if (cq.image) formData.append(`cqs[${index}][image]`, cq.image);
      formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
      formData.append(`cqs[${index}][videoLink]`, cq.videoLink || "");
    });

    try {
      const response = await fetch("/api/cq", { method: "POST", body: formData });
      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
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
          📝 সৃজনশীল প্রশ্ন তৈরি করুন
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
                    এক্সেল ফাইল টেনে আনুন বা ক্� RAI করুন
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
                    value={cqType}
                    onChange={(e) => setCQType(e.target.value)}
                    required
                  >
                    <option value="">সৃজনশীল প্রশ্নের ধরণ নির্বাচন করুন</option>
                    <option value="generalCQ">সাধারণ সৃজনশীল প্রশ্ন</option>
                    <option value="mathCQ">গাণিতিক সৃজনশীল প্রশ্ন</option>
                  </select>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={isMultipleCQs}
                    onChange={(e) => setIsMultipleCQs(e.target.checked)}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-3 text-gray-700 font-semibold text-lg bangla-text">
                    একাধিক সৃজনশীল প্রশ্ন যোগ করুন
                  </label>
                </div>
              </div>

              {cqs.map((cq, cqIndex) => (
                <motion.div
                  key={cqIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 bangla-text">
                    সৃজনশীল প্রশ্ন {cqIndex + 1}
                  </h3>
                  <div className="mb-4 relative">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      উদ্দীপক <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-4 border rounded-lg bangla-text"
                      value={cq.passage}
                      onChange={(e) => handlePassageChange(cqIndex, e.target.value)}
                      onMouseUp={(e) => handleSelection(cqIndex, "passage", null, e)}
                      onKeyUp={(e) => handleSelection(cqIndex, "passage", null, e)}
                      rows={4}
                      placeholder="🔹 উদ্দীপক লিখুন"
                      ref={(el) => (textareaRefs.current[`passage-${cqIndex}-`] = el)}
                      required
                    />
                    <div className="absolute bottom-full left-0" style={{ zIndex: 100 }}>
                      <FormatToolbar
                        onFormat={handleFormat}
                        isVisible={activeField?.cqIndex === cqIndex && activeField?.fieldType === "passage"}
                      />
                    </div>
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
                      value={cq.videoLink}
                      onChange={(e) => handleVideoLinkChange(cqIndex, e.target.value)}
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
                        onChange={(e) => handleImageChange(cqIndex, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 text-lg bangla-text">
                        {cq.image ? cq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {cq.image && (
                    <div className="mb-6">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={cq.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(cqIndex, e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      >
                        <option value="left">বামে</option>
                        <option value="center">মাঝে</option>
                        <option value="right">ডানে</option>
                      </select>
                    </div>
                  )}

                  {cqType === "generalCQ" &&
                    cq.questions.map((question, i) => (
                      <div key={i} className="mb-4">
                        <div className="relative">
                          <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                            {i === 0 ? "জ্ঞানমূলক প্রশ্ন" : i === 1 ? "অনুধাবনমূলক প্রশ্ন" : i === 2 ? "প্রয়োগ প্রশ্ন" : "উচ্চতর দক্ষতা"}
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={question}
                            onChange={(e) => handleQuestionChange(cqIndex, i, e.target.value)}
                            onMouseUp={(e) => handleSelection(cqIndex, "question", i, e)}
                            onKeyUp={(e) => handleSelection(cqIndex, "question", i, e)}
                            rows={2}
                            placeholder={
                              i === 0 ? "জ্ঞানমূলক প্রশ্ন লিখুন" : i === 1 ? "অনুধাবনমূলক প্রশ্ন লিখুন" : i === 2 ? "প্রয়োগ প্রশ্ন লিখুন" : "উচ্চতর দক্ষতা প্রশ্ন লিখুন"
                            }
                            ref={(el) => (textareaRefs.current[`question-${cqIndex}-${i}`] = el)}
                          />
                          <div className="absolute bottom-full left-0" style={{ zIndex: 100 }}>
                            <FormatToolbar
                              onFormat={handleFormat}
                              isVisible={activeField?.cqIndex === cqIndex && activeField?.fieldType === "question" && activeField?.index === i}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 bangla-text">
                          * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                        </p>
                        <div className="relative mt-3">
                          <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                            উত্তর (ঐচ্ছিক)
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={cq.answers[i]}
                            onChange={(e) => handleAnswerChange(cqIndex, i, e.target.value)}
                            onMouseUp={(e) => handleSelection(cqIndex, "answer", i, e)}
                            onKeyUp={(e) => handleSelection(cqIndex, "answer", i, e)}
                            rows={2}
                            placeholder="উত্তর লিখুন"
                            ref={(el) => (textareaRefs.current[`answer-${cqIndex}-${i}`] = el)}
                          />
                          <div className="absolute bottom-full left-0" style={{ zIndex: 100 }}>
                            <FormatToolbar
                              onFormat={handleFormat}
                              isVisible={activeField?.cqIndex === cqIndex && activeField?.fieldType === "answer" && activeField?.index === i}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 bangla-text">
                          * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                        </p>
                      </div>
                    ))}

                  {cqType === "mathCQ" &&
                    cq.latexQuestions.map((question, i) => (
                      <div key={i} className="mb-4">
                        <div className="relative">
                          <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                            {i === 0 ? "জ্ঞানমূলক প্রশ্ন" : i === 1 ? "প্রয়োগ প্রশ্ন" : "উচ্চতর দক্ষতা"}
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={question}
                            onChange={(e) => handleQuestionChange(cqIndex, i, e.target.value, "mathCQ")}
                            onMouseUp={(e) => handleSelection(cqIndex, "question", i, e)}
                            onKeyUp={(e) => handleSelection(cqIndex, "question", i, e)}
                            rows={2}
                            placeholder={
                              i === 0 ? "জ্ঞানমূলক প্রশ্ন লিখুন" : i === 1 ? "প্রয়োগ প্রশ্ন লিখুন" : "উচ্চতর দক্ষতা প্রশ্ন লিখুন"
                            }
                            ref={(el) => (textareaRefs.current[`question-${cqIndex}-${i}`] = el)}
                          />
                          <div className="absolute bottom-full left-0" style={{ zIndex: 100 }}>
                            <FormatToolbar
                              onFormat={handleFormat}
                              isVisible={activeField?.cqIndex === cqIndex && activeField?.fieldType === "question" && activeField?.index === i}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 bangla-text">
                          * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                        </p>
                        <div className="relative mt-3">
                          <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                            উত্তর (ঐচ্ছিক)
                          </label>
                          <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                            value={cq.latexAnswers[i]}
                            onChange={(e) => handleAnswerChange(cqIndex, i, e.target.value, "mathCQ")}
                            onMouseUp={(e) => handleSelection(cqIndex, "answer", i, e)}
                            onKeyUp={(e) => handleSelection(cqIndex, "answer", i, e)}
                            rows={2}
                            placeholder="উত্তর লিখুন"
                            ref={(el) => (textareaRefs.current[`answer-${cqIndex}-${i}`] = el)}
                          />
                          <div className="absolute bottom-full left-0" style={{ zIndex: 100 }}>
                            <FormatToolbar
                              onFormat={handleFormat}
                              isVisible={activeField?.cqIndex === cqIndex && activeField?.fieldType === "answer" && activeField?.index === i}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 bangla-text">
                          * LaTeX ফরম্যাটে লিখুন (যেমন: \frac{1}{2})
                        </p>
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
                  className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 transition shadow-md text-lg bangla-text flex items-center justify-center"
                >
                  <span className="text-xl mr-2">+</span> নতুন সৃজনশীল প্রশ্ন যোগ করুন
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
            {cqs.map((cq, cqIndex) => (
              <motion.div
                key={cqIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-3 bangla-text">
                  CQ {cqIndex + 1}
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                <div className="text-gray-700 mb-4 bangla-text">
                  {renderLines(cq.passage || "উদ্দীপক লিখুন")}
                </div>

                {cq.videoLink && (
                  <div className="mb-4">
                    <a
                      href={cq.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link bangla-text"
                    >
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}

                {cq.image && (
                  <div
                    className={`mb-4 ${cq.imageAlignment === "left" ? "text-left" : cq.imageAlignment === "right" ? "text-right" : "text-center"}`}
                  >
                    <img
                      src={URL.createObjectURL(cq.image)}
                      alt={`CQ preview ${cqIndex + 1}`}
                      className="rounded-lg shadow-md max-h-64 inline-block"
                    />
                  </div>
                )}

                <div className="text-gray-700">
                  {(cqType === "generalCQ" ? cq.questions : cq.latexQuestions).map((ques, i) => (
                    <div key={i} className="mb-3">
                      <p className="bangla-text">
                        {String.fromCharCode(2453 + i)}) {renderLines(ques || "প্রশ্ন লিখুন")}{" "}
                        {cqType === "generalCQ" ? `(${[1, 2, 3, 4][i]} নম্বর)` : `(${[3, 3, 4][i]} নম্বর)`}
                      </p>
                      {(cqType === "generalCQ" ? cq.answers[i] : cq.latexAnswers[i]) && (
                        <p className="text-gray-600 ml-6 bangla-text">
                          <span className="font-semibold">উত্তর:</span>{" "}
                          {renderLines(cqType === "generalCQ" ? cq.answers[i] : cq.latexAnswers[i])}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | পেপার: {selectedSubjectPaper || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"} | কন্টেন্ট: {selectedContentType || "N/A"} | উপ-অধ্যায়: {selectedSubChapter || "N/A"} | ধরণ: {cqType || "N/A"}
                </p>
              </motion.div>
            ))}
            {cqs.length === 0 && (
              <p className="text-gray-500 text-center text-lg bangla-text">প্রিভিউ দেখতে প্রশ্ন যোগ করুন</p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}