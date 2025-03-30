"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { createEditor, Editor, Transforms, Text } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import dynamic from "next/dynamic";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

// Normalize text to Unicode NFC
const normalizeText = (text) => text.normalize("NFC");

// Custom Leaf component
const Leaf = ({ attributes, children, leaf }) => {
  let styledChildren = children;
  if (leaf.math) {
    return <span {...attributes} className="mathjax" dangerouslySetInnerHTML={{ __html: `\\(${leaf.text}\\)` }} />;
  }
  if (leaf.bold) styledChildren = <strong>{styledChildren}</strong>;
  if (leaf.italic) styledChildren = <em>{styledChildren}</em>;
  if (leaf.underline) styledChildren = <u>{styledChildren}</u>;
  if (leaf.strikethrough) styledChildren = <del>{styledChildren}</del>;
  return <span {...attributes} className="bangla-text">{styledChildren}</span>;
};

// Custom Element component
const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "bulleted-list": return <ul {...attributes} className="list-disc pl-5">{children}</ul>;
    case "numbered-list": return <ol {...attributes} className="list-decimal pl-5">{children}</ol>;
    case "list-item": return <li {...attributes}>{children}</li>;
    case "heading-one": return <h1 {...attributes} className="text-2xl font-bold">{children}</h1>;
    case "heading-two": return <h2 {...attributes} className="text-xl font-semibold">{children}</h2>;
    case "heading-three": return <h3 {...attributes} className="text-lg font-medium">{children}</h3>;
    default: return <p {...attributes}>{children}</p>;
  }
};

// Toolbar Button
const ToolbarButton = ({ format, icon, label, tooltip }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format) || isBlockActive(editor, format);

  const toggleFormat = () => {
    if (["bold", "italic", "underline", "strikethrough", "math"].includes(format)) {
      toggleMark(editor, format);
    } else {
      toggleBlock(editor, format);
    }
  };

  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleFormat();
      }}
      className={`px-2 py-1 mx-1 rounded ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-400 hover:text-white transition`}
      title={tooltip}
    >
      {icon || label}
    </button>
  );
};

// Mark and Block utilities
const isMarkActive = (editor, format) => Editor.marks(editor)?.[format] === true;
const isBlockActive = (editor, format) => !!Editor.nodes(editor, { match: (n) => n.type === format })[0];
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  isActive ? Editor.removeMark(editor, format) : Editor.addMark(editor, format, true);
};
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = ["bulleted-list", "numbered-list"].includes(format);
  Transforms.unwrapNodes(editor, { match: (n) => ["bulleted-list", "numbered-list"].includes(n.type), split: true });
  Transforms.setNodes(editor, { type: isActive ? "paragraph" : isList ? "list-item" : format });
  if (!isActive && isList) Transforms.wrapNodes(editor, { type: format, children: [] });
};

// Custom Slate Editor
const CustomEditor = ({ value, onChange, placeholder }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <div className="slate-editor border rounded-lg mb-4">
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <div className="toolbar p-2 border-b bg-gray-100 rounded-t-lg flex flex-wrap gap-1">
          <ToolbarButton format="bold" icon="B" tooltip="Bold (Ctrl+B)" />
          <ToolbarButton format="italic" icon="I" tooltip="Italic (Ctrl+I)" />
          <ToolbarButton format="underline" icon="U" tooltip="Underline (Ctrl+U)" />
          <ToolbarButton format="strikethrough" icon="S" tooltip="Strikethrough" />
          <ToolbarButton format="math" icon="∑" tooltip="Math Mode (Ctrl+M)" />
          <ToolbarButton format="heading-one" label="H1" tooltip="Heading 1" />
          <ToolbarButton format="heading-two" label="H2" tooltip="Heading 2" />
          <ToolbarButton format="heading-three" label="H3" tooltip="Heading 3" />
          <ToolbarButton format="bulleted-list" icon="•" tooltip="Bulleted List" />
          <ToolbarButton format="numbered-list" icon="1." tooltip="Numbered List" />
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
          className="p-3 min-h-[120px] max-h-[200px] overflow-y-auto bangla-text"
          onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey) {
              switch (event.key) {
                case "b": event.preventDefault(); toggleMark(editor, "bold"); break;
                case "i": event.preventDefault(); toggleMark(editor, "italic"); break;
                case "u": event.preventDefault(); toggleMark(editor, "underline"); break;
                case "m": event.preventDefault(); toggleMark(editor, "math"); break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

// Serialize and Deserialize
const serializeToHtml = (nodes) => {
  return nodes
    .map((node) => {
      if (Text.isText(node)) {
        let text = normalizeText(node.text);
        if (node.math) return `<span class="mathjax">\\(${text}\\)</span>`;
        if (node.bold) text = `<strong>${text}</strong>`;
        if (node.italic) text = `<em>${text}</em>`;
        if (node.underline) text = `<u>${text}</u>`;
        if (node.strikethrough) text = `<del>${text}</del>`;
        return text;
      }
      const children = serializeToHtml(node.children);
      switch (node.type) {
        case "heading-one": return `<h1>${children}</h1>`;
        case "heading-two": return `<h2>${children}</h2>`;
        case "heading-three": return `<h3>${children}</h3>`;
        case "bulleted-list": return `<ul>${children}</ul>`;
        case "numbered-list": return `<ol>${children}</ol>`;
        case "list-item": return `<li>${children}</li>`;
        default: return `<p>${children}</p>`;
      }
    })
    .join("");
};

export default function CreateCQAdmin() {
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
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [subjectParts, setSubjectParts] = useState([]);
  const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
  const [cqType, setCQType] = useState("");
  const [isMultipleCQs, setIsMultipleCQs] = useState(false);
  const initialSlateValue = [{ type: "paragraph", children: [{ text: "" }] }];

  const [cqs, setCQs] = useState([
    {
      passage: initialSlateValue,
      questions: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
      answers: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
      latexQuestions: ["", "", ""],
      latexAnswers: ["", "", ""],
      image: null,
      imageAlignment: "center",
      videoLink: "",
      latexPassage: "",
    },
  ]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/cq");
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
      if (!selectedClass) return;
      try {
        const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
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
        }
      } catch (error) {
        toast.error("ক্লাস ডেটা লোড করতে ব্যর্থ");
      }
    }
    fetchClassData();
  }, [selectedClass]);

  const addNewCQ = () => {
    setCQs([
      ...cqs,
      {
        passage: initialSlateValue,
        questions: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
        answers: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
        latexQuestions: ["", "", ""],
        latexAnswers: ["", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
        latexPassage: "",
      },
    ]);
  };

  const handlePassageChange = (cqIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].passage = value;
    setCQs(newCQs);
  };

  const handleMathCQChange = (cqIndex, latexValue) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].latexPassage = latexValue;
    setCQs(newCQs);
  };

  const handleQuestionChange = (cqIndex, qIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].questions[qIndex] = value;
    setCQs(newCQs);
  };

  const handleAnswerChange = (cqIndex, qIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].answers[qIndex] = value;
    setCQs(newCQs);
  };

  const handleMathQuestionChange = (cqIndex, qIndex, latexValue) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].latexQuestions[qIndex] = latexValue;
    setCQs(newCQs);
  };

  const handleMathAnswerChange = (cqIndex, qIndex, latexValue) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].latexAnswers[qIndex] = latexValue;
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

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        Class: "",
        Subject: "",
        "Chapter Number": "",
        "Chapter Name": "",
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
        "Chapter Number": 1,
        "Chapter Name": "Chapter 1",
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
            passage: normalizeText(row.Passage || ""),
            classNumber: row.Class || selectedClass,
            subject: row.Subject || selectedSubject,
            chapterNumber: row["Chapter Number"] || selectedChapter,
            chapterName: row["Chapter Name"] || selectedChapterName,
            cqType: row["CQ Type"] || cqType,
            questions:
              row["CQ Type"] === "generalCQ"
                ? [
                    normalizeText(row["Knowledge Question"] || ""),
                    normalizeText(row["Comprehension Question"] || ""),
                    normalizeText(row["Application Question"] || ""),
                    normalizeText(row["Higher Skills Question"] || ""),
                  ]
                : [
                    normalizeText(row["Knowledge Question"] || ""),
                    normalizeText(row["Application Question"] || ""),
                    normalizeText(row["Higher Skills Question"] || ""),
                  ],
            answers:
              row["CQ Type"] === "generalCQ"
                ? [
                    normalizeText(row["Knowledge Answer"] || ""),
                    normalizeText(row["Comprehension Answer"] || ""),
                    normalizeText(row["Application Answer"] || ""),
                    normalizeText(row["Higher Skills Answer"] || ""),
                  ]
                : [
                    normalizeText(row["Knowledge Answer"] || ""),
                    normalizeText(row["Application Answer"] || ""),
                    normalizeText(row["Higher Skills Answer"] || ""),
                  ],
            imageAlignment: row["Image Alignment"] || "center",
            videoLink: row["Video Link"] || "",
          }));

          const response = await fetch("/api/cq/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questions: extractedQuestions }),
          });

          if (response.ok) toast.success("প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
          else {
            const errorData = await response.json();
            toast.error(`❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ: ${errorData.error}`);
          }
        } else toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
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
    setCQs([
      {
        passage: initialSlateValue,
        questions: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
        answers: [initialSlateValue, initialSlateValue, initialSlateValue, initialSlateValue],
        latexQuestions: ["", "", ""],
        latexAnswers: ["", "", ""],
        image: null,
        imageAlignment: "center",
        videoLink: "",
        latexPassage: "",
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
    formData.append("teacherEmail", "admin");
    formData.append("cqType", cqType);

    cqs.forEach((cq, index) => {
      const passageHtml = cqType === "generalCQ" ? serializeToHtml(cq.passage) : cq.latexPassage;
      const questionsHtml = cqType === "generalCQ" ? cq.questions.map(serializeToHtml) : cq.latexQuestions;
      const answersHtml = cqType === "generalCQ" ? cq.answers.map(serializeToHtml) : cq.latexAnswers;

      formData.append(`cqs[${index}][passage]`, passageHtml);
      formData.append(`cqs[${index}][questions]`, JSON.stringify(questionsHtml));
      formData.append(`cqs[${index}][answers]`, JSON.stringify(answersHtml));
      if (cq.image) formData.append(`cqs[${index}][image]`, cq.image);
      formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
      formData.append(`cqs[${index}][videoLink]`, cq.videoLink);
    });

    try {
      const response = await fetch("/api/cq/import", { method: "POST", body: formData });
      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
        resetForm();
      } else toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`);
    } catch (error) {
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
          .slate-editor { border: 1px solid #d1d5db; border-radius: 0.5rem; margin-bottom: 1.5rem; }
          .slate-editor .toolbar { border-bottom: 1px solid #d1d5db; background-color: #f7fafc; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
          .form-section, .preview-section { min-height: 80vh; }
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
          📝 সৃজনশীল প্রশ্ন তৈরি করুন
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
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">বিষয়</label>
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

                {selectedSubject && subjectParts.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">বিষয়ের অংশ</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
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
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">অধ্যায়</label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-lg bangla-text"
                      value={selectedChapter}
                      onChange={(e) => {
                        const selected = chapters.find((chap) => chap.number === parseInt(e.target.value));
                        setSelectedChapter(e.target.value);
                        setSelectedChapterName(selected?.name || "");
                      }}
                      required
                    >
                      <option value="">অধ্যায় নির্বাচন করুন</option>
                      {chapters.map((chapter) => (
                        <option key={`${chapter.number}-${chapter.name}`} value={chapter.number}>
                          {chapter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 bangla-text">প্রশ্নের ধরণ</label>
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

                <div className="flex items-center">
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
                  className="mt-8 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 bangla-text">
                    সৃজনশীল প্রশ্ন {cqIndex + 1}
                  </h3>
                  <label className="block text-gray-700 font-semibold mb-2 bangla-text">উদ্দীপক</label>
                  {cqType === "generalCQ" ? (
                    <CustomEditor
                      value={cq.passage}
                      onChange={(value) => handlePassageChange(cqIndex, value)}
                      placeholder="🔹 অনুচ্ছেদ লিখুন"
                    />
                  ) : (
                    <EditableMathField
                      latex={cq.latexPassage || ""}
                      onChange={(mathField) => handleMathCQChange(cqIndex, mathField.latex())}
                      className="border p-3 rounded-lg w-full text-lg shadow-sm"
                    />
                  )}

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
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          {i === 0 ? "জ্ঞানমূলক প্রশ্ন" : i === 1 ? "অনুধাবনমূলক প্রশ্ন" : i === 2 ? "প্রয়োগ প্রশ্ন" : "উচ্চতর দক্ষতা"}
                        </label>
                        <CustomEditor
                          value={question}
                          onChange={(value) => handleQuestionChange(cqIndex, i, value)}
                          placeholder={
                            i === 0 ? "জ্ঞানমূলক প্রশ্ন লিখুন" : i === 1 ? "অনুধাবনমূলক প্রশ্ন লিখুন" : i === 2 ? "প্রয়োগ প্রশ্ন লিখুন" : "উচ্চতর দক্ষতা প্রশ্ন লিখুন"
                          }
                        />
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">উত্তর (ঐচ্ছিক)</label>
                        <CustomEditor
                          value={cq.answers[i]}
                          onChange={(value) => handleAnswerChange(cqIndex, i, value)}
                          placeholder="উত্তর লিখুন"
                        />
                      </div>
                    ))}

                  {cqType === "mathCQ" &&
                    cq.latexQuestions.map((question, i) => (
                      <div key={i} className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          {i === 0 ? "জ্ঞানমূলক প্রশ্ন" : i === 1 ? "প্রয়োগ প্রশ্ন" : "উচ্চতর দক্ষতা"}
                        </label>
                        <EditableMathField
                          latex={cq.latexQuestions[i] || ""}
                          onChange={(mathField) => handleMathQuestionChange(cqIndex, i, mathField.latex())}
                          className="border p-3 rounded-lg w-full text-lg shadow-sm"
                        />
                        <label className="block text-gray-700 font-semibold mb-2 mt-3 bangla-text">উত্তর (ঐচ্ছিক)</label>
                        <EditableMathField
                          latex={cq.latexAnswers[i] || ""}
                          onChange={(mathField) => handleMathAnswerChange(cqIndex, i, mathField.latex())}
                          className="border p-3 rounded-lg w-full text-lg shadow-sm"
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
                  className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 transition shadow-md text-lg bangla-text flex items-center justify-center"
                >
                  <span className="text-xl mr-2">+</span> নতুন সৃজনশীল প্রশ্ন যোগ করুন
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
                {cqType === "generalCQ" ? (
                  <div
                    className="text-gray-700 mb-4 bangla-text"
                    dangerouslySetInnerHTML={{ __html: serializeToHtml(cq.passage) || "অনুচ্ছেদ লিখুন" }}
                  />
                ) : (
                  <StaticMathField className="text-gray-700 mb-4">{cq.latexPassage || "গাণিতিক উদ্দীপক লিখুন"}</StaticMathField>
                )}

                {cq.videoLink && (
                  <div className="mb-4">
                    <a href={cq.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
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
                        {String.fromCharCode(2453 + i)}) {cqType === "generalCQ" ? (
                          <span dangerouslySetInnerHTML={{ __html: serializeToHtml(ques) || "প্রশ্ন লিখুন" }} />
                        ) : (
                          <StaticMathField className="inline-block">{ques || "প্রশ্ন লিখুন"}</StaticMathField>
                        )}{" "}
                        {cqType === "generalCQ" ? `(${[1, 2, 3, 4][i]} নম্বর)` : `(${[3, 3, 4][i]} নম্বর)`}
                      </p>
                      {(cqType === "generalCQ" ? cq.answers[i] : cq.latexAnswers[i]) && (
                        <p className="text-gray-600 ml-6 bangla-text">
                          <span className="font-semibold">উত্তর:</span>{" "}
                          {cqType === "generalCQ" ? (
                            <span dangerouslySetInnerHTML={{ __html: serializeToHtml(cq.answers[i]) }} />
                          ) : (
                            <StaticMathField className="inline-block">{cq.latexAnswers[i]}</StaticMathField>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 mt-4 bangla-text">
                  ক্লাস: {selectedClass || "N/A"} | বিষয়: {selectedSubject || "N/A"} | অংশ: {selectedSubjectPart || "N/A"} | অধ্যায়: {selectedChapterName || "N/A"} | ধরণ: {cqType || "N/A"}
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