"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Head from "next/head";
import { createEditor, Editor, Transforms, Text } from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import dynamic from 'next/dynamic';

const EditableMathField = dynamic(() => import('react-mathquill').then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import('react-mathquill').then((mod) => mod.StaticMathField), { ssr: false });


// Normalize text to Unicode NFC
const normalizeText = (text) => {
  return text.normalize("NFC");
};

// Custom Leaf component to render text with formatting
const Leaf = ({ attributes, children, leaf }) => {
  let styledChildren = children;
  if (leaf.math) {
    return (
      <span
        {...attributes}
        className="mathjax"
        dangerouslySetInnerHTML={{ __html: `\\(${leaf.text}\\)` }}
      />
    );
  }
  if (leaf.bold) {
    styledChildren = <strong>{styledChildren}</strong>;
  }
  if (leaf.italic) {
    styledChildren = <em>{styledChildren}</em>;
  }
  if (leaf.underline) {
    styledChildren = <u>{styledChildren}</u>;
  }
  if (leaf.strikethrough) {
    styledChildren = <del>{styledChildren}</del>;
  }
  return <span {...attributes} className="bangla-text">{styledChildren}</span>;
};

// Custom Element component to render block-level elements
const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "bulleted-list":
      return <ul {...attributes} className="list-disc pl-5">{children}</ul>;
    case "numbered-list":
      return <ol {...attributes} className="list-decimal pl-5">{children}</ol>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "heading-one":
      return <h1 {...attributes} className="text-2xl font-bold">{children}</h1>;
    case "heading-two":
      return <h2 {...attributes} className="text-xl font-semibold">{children}</h2>;
    case "heading-three":
      return <h3 {...attributes} className="text-lg font-medium">{children}</h3>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Toolbar button component
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
      className={`px-2 py-1 mx-1 rounded ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
        } hover:bg-blue-400 hover:text-white transition`}
      title={tooltip}
    >
      {icon || label}
    </button>
  );
};

// Check if a mark (e.g., bold, italic) is active
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Check if a block (e.g., heading, list) is active
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });
  return !!match;
};

// Toggle a mark (e.g., bold, italic)
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Toggle a block (e.g., heading, list)
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = ["bulleted-list", "numbered-list"].includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => ["bulleted-list", "numbered-list"].includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

// Custom Slate Editor component with paste handling
const CustomEditor = ({ value, onChange, placeholder }) => {
  const defaultValue = [{ type: "paragraph", children: [{ text: "" }] }];
  const editorValue = Array.isArray(value) && value.length > 0 ? value : defaultValue;

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  // Handle paste to normalize text and remove unwanted formatting
  const handlePaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData.getData("text/plain");
    const normalizedText = normalizeText(pastedText);

    Transforms.insertText(editor, normalizedText, {
      at: editor.selection || { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } },
    });
  };

  return (
    <div className="slate-editor border rounded-lg mb-4 bangla-text">
      <Slate editor={editor} initialValue={editorValue} onChange={onChange}>
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
          className="p-3 min-h-[100px] max-h-[200px] overflow-y-auto bangla-text"
          onPaste={handlePaste}
          onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey) {
              switch (event.key) {
                case "b":
                  event.preventDefault();
                  toggleMark(editor, "bold");
                  break;
                case "i":
                  event.preventDefault();
                  toggleMark(editor, "italic");
                  break;
                case "u":
                  event.preventDefault();
                  toggleMark(editor, "underline");
                  break;
                case "m":
                  event.preventDefault();
                  toggleMark(editor, "math");
                  break;
                default:
                  return;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
};

// Serialize Slate content to HTML with normalization
const serializeToHtml = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) {
    return "";
  }
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
        case "heading-one":
          return `<h1>${children}</h1>`;
        case "heading-two":
          return `<h2>${children}</h2>`;
        case "heading-three":
          return `<h3>${children}</h3>`;
        case "bulleted-list":
          return `<ul>${children}</ul>`;
        case "numbered-list":
          return `<ol>${children}</ol>`;
        case "list-item":
          return `<li>${children}</li>`;
        default:
          return `<p>${children}</p>`;
      }
    })
    .join("");
};

// Main CreateSQAdmin Component
export default function CreateSQAdmin() {
  useEffect(() => {
    (async function applyMathquillStyles() {
      const { addStyles } = await import('react-mathquill');
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

  const initialSlateValue = [{ type: "paragraph", children: [{ text: "" }] }];

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
        console.log("Initial Classes Data:", data);
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
        console.log("API Response for classNumber", selectedClass, ":", data);

        if (data.length > 0) {
          const subjects = [...new Set(data.map((item) => item.subject))];
          const subjectParts = [...new Set(data.map((item) => item.subjectPart).filter(Boolean))];
          const chapters = [
            ...new Set(
              data.map((item) => ({
                chapterNumber: item.chapterNumber,
                chapterName: item.chapterName,
              }))
            ),
          ];
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
        question: initialSlateValue,
        answer: initialSlateValue,
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
        Question: "শক্তি কীভাবে স্থানান্তরিত হয় তা ব্যাখ্যা কর।",
        Answer: "শক্তি বিকিরণের মাধ্যমে স্থানান্তরিত হয়।",
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
          }));

          const response = await fetch("/api/sq/import", {
            method: "POST",
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
    setSubjects([]);
    setSelectedSubject("");
    setSubjectParts([]);
    setSelectedSubjectPart("");
    setChapters([]);
    setSelectedChapterNumber("");
    setSelectedChapterName("");
    setSQs([
      {
        type: "জ্ঞানমূলক",
        question: initialSlateValue,
        answer: initialSlateValue,
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("classLevel", selectedClass);
    formData.append("subjectName", selectedSubject);
    formData.append("subjectPart", selectedSubjectPart || "");
    formData.append("chapterNumber", selectedChapterNumber);
    formData.append("chapterName", selectedChapterName);
    formData.append("teacherEmail", "admin");

    sqs.forEach((sq, index) => {
      const questionHtml = sq.question;
      const answerHtml = sq.answer;

      formData.append(`sqs[${index}][type]`, sq.type);
      formData.append(`sqs[${index}][question]`, questionHtml);
      formData.append(`sqs[${index}][answer]`, answerHtml);
      if (sq.image) {
        formData.append(`sqs[${index}][image]`, sq.image);
      }
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
        toast.success(`✅ ${sqs.length}টি সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!`, {
          position: "top-right",
        });
        resetForm();
      } else {
        toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!", { position: "top-right" });
    }
  };

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML"
          async
        ></script>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 সংক্ষিপ্ত প্রশ্ন তৈরি করুন
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
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                    ক্লাস
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
                      বিষয়
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

                {selectedSubject && subjectParts.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      বিষয়ের অংশ
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedSubjectPart}
                      onChange={(e) => setSelectedSubjectPart(e.target.value)}
                    >
                      <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                      {subjectParts.map((part) => (
                        <option key={part} value={part}>
                          {part}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedSubject && chapters.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      অধ্যায়
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={selectedChapterNumber}
                      onChange={(e) => {
                        const selected = chapters.find(
                          (chap) => chap.chapterNumber === parseInt(e.target.value)
                        );
                        setSelectedChapterNumber(e.target.value);
                        setSelectedChapterName(selected?.chapterName || "");
                      }}
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
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
                  className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                    সংক্ষিপ্ত প্রশ্ন {index + 1}
                  </h3>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      প্রশ্নের ধরণ
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm mb-4 bangla-text"
                      value={sq.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      required
                    >
                      <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
                      <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
                      <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
                      <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      প্রশ্ন লিখুন
                    </label>
                    <EditableMathField
                      latex="" // Set initial value or empty string
                      onChange={(mathField) => handleQuestionChange(index, mathField.latex())}
                      className="border p-2 rounded-md w-full text-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                      উত্তর লিখুন (ঐচ্ছিক)
                    </label>
                    <EditableMathField
                      latex="" // Set initial value or empty string
                      onChange={(mathField) => handleAnswerChange(index, mathField.latex())}
                      className="border p-2 rounded-md w-full text-lg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={sq.videoLink}
                      onChange={(e) => handleVideoLinkChange(index, e.target.value)}
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
                        onChange={(e) => handleImageChange(index, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 bangla-text">
                        {sq.image ? sq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {sq.image && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={sq.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(index, e.target.value)}
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
                  <span className="text-xl mr-2">+</span> নতুন সংক্ষিপ্ত প্রশ্ন যোগ করুন
                </motion.button>
              )}

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

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-4 bangla-text">প্রিভিউ</h2>
            {sqs.map((sq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2 bangla-text">
                  SQ
                </p>
                <div className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                  {sq.type ? `${sq.type}: ` : ""}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: serializeToHtml(sq.question) || "প্রশ্ন লিখুন",
                    }}
                  />
                </div>
                {sq.videoLink && (
                  <div className="mb-4">
                    <a
                      href={sq.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link bangla-text"
                    >
                      📹 ভিডিও দেখুন
                    </a>
                  </div>
                )}
                {sq.image && (
                  <div
                    className={`mb-4 ${sq.imageAlignment === "left"
                        ? "text-left"
                        : sq.imageAlignment === "right"
                          ? "text-right"
                          : "text-center"
                      }`}
                  >
                    <img
                      src={URL.createObjectURL(sq.image)}
                      alt={`SQ preview ${index + 1}`}
                      className="rounded-lg shadow-md max-h-48 inline-block"
                    />
                  </div>
                )}
                {sq.answer && sq.answer[0]?.children[0]?.text && (
                  <div className="text-gray-700 mb-4 bangla-text">
                    <span className="font-semibold">উত্তর:</span>{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: serializeToHtml(sq.answer),
                      }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-3 bangla-text">
                  Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter:{" "}
                  {selectedChapterName || "N/A"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}