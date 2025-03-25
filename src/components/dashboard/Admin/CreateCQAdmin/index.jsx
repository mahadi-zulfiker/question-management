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

// Normalize text to Unicode NFC
const normalizeText = (text) => {
  return text.normalize("NFC");
};

// Custom Leaf component
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

// Custom Element component
const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc pl-5">
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol {...attributes} className="list-decimal pl-5">
          {children}
        </ol>
      );
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "heading-one":
      return (
        <h1 {...attributes} className="text-2xl font-bold">
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 {...attributes} className="text-xl font-semibold">
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 {...attributes} className="text-lg font-medium">
          {children}
        </h3>
      );
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
      className={`px-2 py-1 mx-1 rounded ${
        isActive ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
      } hover:bg-blue-400 hover:text-white transition`}
      title={tooltip}
    >
      {icon || label}
    </button>
  );
};

// Check if a mark is active
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Check if a block is active
const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });
  return !!match;
};

// Toggle a mark
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Toggle a block
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

// Custom Slate Editor component
const CustomEditor = ({ value, onChange, placeholder }) => {
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

// Serialize Slate content to HTML
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

// Deserialize HTML to Slate content
const deserializeFromHtml = (html) => {
  if (!html) return [{ type: "paragraph", children: [{ text: "" }] }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const deserializeNode = (node) => {
    if (node.nodeType === 3) {
      return { text: normalizeText(node.textContent) };
    }

    const children = Array.from(node.childNodes).map(deserializeNode).filter(Boolean);

    if (node.nodeName === "P") {
      return { type: "paragraph", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "H1") {
      return { type: "heading-one", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "H2") {
      return { type: "heading-two", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "H3") {
      return { type: "heading-three", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "UL") {
      return { type: "bulleted-list", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "OL") {
      return { type: "numbered-list", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "LI") {
      return { type: "list-item", children: children.length ? children : [{ text: "" }] };
    }
    if (node.nodeName === "SPAN" && node.className === "mathjax") {
      const text = normalizeText(node.textContent.replace(/\\\(|\\/g, ""));
      return { math: true, text };
    }
    if (node.nodeName === "STRONG") {
      return { bold: true, text: normalizeText(node.textContent) };
    }
    if (node.nodeName === "EM") {
      return { italic: true, text: normalizeText(node.textContent) };
    }
    if (node.nodeName === "U") {
      return { underline: true, text: normalizeText(node.textContent) };
    }
    if (node.nodeName === "DEL") {
      return { strikethrough: true, text: normalizeText(node.textContent) };
    }

    return children.length ? children : [{ text: "" }];
  };

  const nodes = Array.from(body.childNodes).map(deserializeNode).filter(Boolean);
  return nodes.length ? nodes : [{ type: "paragraph", children: [{ text: "" }] }];
};

export default function CreateCQAdmin() {
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
      mathQuestions: [initialSlateValue, initialSlateValue, initialSlateValue],
      mathAnswers: [initialSlateValue, initialSlateValue, initialSlateValue],
      image: null,
      imageAlignment: "center",
      videoLink: "",
    },
  ]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/cq");
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
        const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
        const data = await res.json();
        if (data.length > 0) {
          setSubjects([...new Set(data.map((item) => item.subject))]);
          setSubjectParts([
            ...new Set(data.map((item) => item.subjectPart).filter((part) => part)),
          ]);
          const chapterMap = new Map();
          data.forEach((item) => {
            const key = `${item.chapterNumber}-${item.chapterName}`;
            if (!chapterMap.has(key)) {
              chapterMap.set(key, {
                number: item.chapterNumber,
                name: item.chapterName,
              });
            }
          });
          const uniqueChapters = Array.from(chapterMap.values());
          setChapters(uniqueChapters);
        }
      } catch (error) {
        toast.error("Failed to load class data");
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
        mathQuestions: [initialSlateValue, initialSlateValue, initialSlateValue],
        mathAnswers: [initialSlateValue, initialSlateValue, initialSlateValue],
        image: null,
        imageAlignment: "center",
        videoLink: "",
      },
    ]);
  };

  const handlePassageChange = (cqIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].passage = value;
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

  const handleMathQuestionChange = (cqIndex, qIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].mathQuestions[qIndex] = value;
    setCQs(newCQs);
  };

  const handleMathAnswerChange = (cqIndex, qIndex, value) => {
    const newCQs = [...cqs];
    newCQs[cqIndex].mathAnswers[qIndex] = value;
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
      {
        Class: 9,
        Subject: "Mathematics",
        "Chapter Number": 2,
        "Chapter Name": "Chapter 2",
        "CQ Type": "mathCQ",
        Passage: "This is a sample passage for a math CQ.",
        "Knowledge Question": "What is the formula for the area of a circle?",
        "Knowledge Answer": "πr^2",
        "Comprehension Question": "",
        "Comprehension Answer": "",
        "Application Question": "Calculate the area of a circle with radius 5 cm.",
        "Application Answer": "78.54 cm^2",
        "Higher Skills Question": "Derive the formula for the area of a circle.",
        "Higher Skills Answer": "Using integration, the area is πr^2.",
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
        mathQuestions: [initialSlateValue, initialSlateValue, initialSlateValue],
        mathAnswers: [initialSlateValue, initialSlateValue, initialSlateValue],
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
    formData.append("teacherEmail", "admin");
    formData.append("cqType", cqType);

    cqs.forEach((cq, index) => {
      const passageHtml = serializeToHtml(cq.passage);
      const questionsHtml = (cqType === "generalCQ" ? cq.questions : cq.mathQuestions).map((q) =>
        serializeToHtml(q)
      );
      const answersHtml = (cqType === "generalCQ" ? cq.answers : cq.mathAnswers).map((a) =>
        serializeToHtml(a)
      );

      formData.append(`cqs[${index}][passage]`, passageHtml);
      formData.append(`cqs[${index}][questions]`, JSON.stringify(questionsHtml));
      formData.append(`cqs[${index}][answers]`, JSON.stringify(answersHtml));
      if (cq.image) {
        formData.append(`cqs[${index}][image]`, cq.image);
      }
      formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
      formData.append(`cqs[${index}][videoLink]`, cq.videoLink);
    });

    try {
      const response = await fetch("/api/cq/import", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success(`✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`, {
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
        <style>{`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;

          * {
            box-sizing: border-box;
          }

          body {
            font-family: var(--font-noto-bengali), sans-serif !important;
          }

          .slate-editor, .bangla-text, input.bangla-text, textarea.bangla-text {
            font-family: var(--font-noto-bengali), sans-serif !important;
          }

          .bangla-text::placeholder {
            font-family: var(--font-noto-bengali), sans-serif !important;
          }

          @layer base {
            :root {
              --background: 0 0% 100%;
              --foreground: 0 0% 3.9%;
              --card: 0 0% 100%;
              --card-foreground: 0 0% 3.9%;
              --popover: 0 0% 100%;
              --popover-foreground: 0 0% 3.9%;
              --primary: 0 0% 9%;
              --primary-foreground: 0 0% 98%;
              --secondary: 0 0% 96.1%;
              --secondary-foreground: 0 0% 9%;
              --muted: 0 0% 96.1%;
              --muted-foreground: 0 0% 45.1%;
              --accent: 0 0% 96.1%;
              --accent-foreground: 0 0% 9%;
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 0 0% 98%;
              --border: 0 0% 89.8%;
              --input: 0 0% 89.8%;
              --ring: 0 0% 3.9%;
              --chart-1: 12 76% 61%;
              --chart-2: 173 58% 39%;
              --chart-3: 197 37% 24%;
              --chart-4: 43 74% 66%;
              --chart-5: 27 87% 67%;
              --radius: 0.5rem;
            }

            .dark {
              --background: 0 0% 3.9%;
              --foreground: 0 0% 98%;
              --card: 0 0% 3.9%;
              --card-foreground: 0 0% 98%;
              --popover: 0 0% 3.9%;
              --popover-foreground: 0 0% 98%;
              --primary: 0 0% 98%;
              --primary-foreground: 0 0% 9%;
              --secondary: 0 0% 14.9%;
              --secondary-foreground: 0 0% 98%;
              --muted: 0 0% 14.9%;
              --muted-foreground: 0 0% 63.9%;
              --accent: 0 0% 14.9%;
              --accent-foreground: 0 0% 98%;
              --destructive: 0 62.8% 30.6%;
              --destructive-foreground: 0 0% 98%;
              --border: 0 0% 14.9%;
              --input: 0 0% 14.9%;
              --ring: 0 0% 83.1%;
              --chart-1: 220 70% 50%;
              --chart-2: 160 60% 45%;
              --chart-3: 30 80% 55%;
              --chart-4: 280 65% 60%;
              --chart-5: 340 75% 55%;
            }
          }

          @layer base {
            * {
              @apply border-border;
            }
            body {
              @apply bg-background text-foreground;
            }
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a1a1aa;
            border-radius: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #78788a;
          }

          @keyframes slideDown {
            0% {
              transform: translateY(-20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
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

          .slate-editor {
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
          }

          .slate-editor .toolbar {
            border-bottom: 1px solid #d1d5db;
            background-color: #f7fafc;
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
          }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center text-blue-700 mb-8 bangla-text"
        >
          📝 সৃজনশীল প্রশ্ন তৈরি করুন
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
                      value={selectedChapter}
                      onChange={(e) => {
                        const selected = chapters.find(
                          (chap) => chap.number === parseInt(e.target.value)
                        );
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
                  <label className="block text-gray-700 font-semibold mb-1 bangla-text">
                    প্রশ্নের ধরণ
                  </label>
                  <select
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700 font-medium bangla-text">
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
                  className="mt-6 p-5 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 bangla-text">
                    সৃজনশীল প্রশ্ন {cqIndex + 1}
                  </h3>
                  <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                    উদ্দীপক
                  </label>
                  <CustomEditor
                    value={cq.passage}
                    onChange={(value) => handlePassageChange(cqIndex, value)}
                    placeholder="🔹 অনুচ্ছেদ লিখুন"
                  />

                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                      ভিডিও লিঙ্ক যুক্ত করুন (ঐচ্ছিক)
                    </label>
                    <input
                      type="url"
                      placeholder="উদাহরণ: https://drive.google.com/file/d/..."
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      value={cq.videoLink}
                      onChange={(e) => handleVideoLinkChange(cqIndex, e.target.value)}
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
                        onChange={(e) => handleImageChange(cqIndex, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <p className="text-center text-gray-500 bangla-text">
                        {cq.image ? cq.image.name : "ছবি টেনে আনুন বা ক্লিক করুন"}
                      </p>
                    </div>
                  </div>

                  {cq.image && (
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                        ছবির অ্যালাইনমেন্ট
                      </label>
                      <select
                        value={cq.imageAlignment}
                        onChange={(e) => handleImageAlignmentChange(cqIndex, e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                      >
                        <option value="left">বামে</option>
                        <option value="center">মাঝে</option>
                        <option value="right">ডানে</option>
                      </select>
                    </div>
                  )}

                  {cqType === "generalCQ" &&
                    cq.questions.map((question, i) => (
                      <div key={i} className="mb-3">
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          {i === 0
                            ? "জ্ঞানমূলক প্রশ্ন"
                            : i === 1
                            ? "অনুধাবনমূলক প্রশ্ন"
                            : i === 2
                            ? "প্রয়োগ প্রশ্ন"
                            : "উচ্চতর দক্ষতা"}
                        </label>
                        <CustomEditor
                          value={question}
                          onChange={(value) => handleQuestionChange(cqIndex, i, value)}
                          placeholder={
                            i === 0
                              ? "জ্ঞানমূলক প্রশ্ন লিখুন"
                              : i === 1
                              ? "অনুধাবনমূলক প্রশ্ন লিখুন"
                              : i === 2
                              ? "প্রয়োগ প্রশ্ন লিখুন"
                              : "উচ্চতর দক্ষতা প্রশ্ন লিখুন"
                          }
                        />
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          উত্তর (ঐচ্ছিক)
                        </label>
                        <CustomEditor
                          value={cq.answers[i]}
                          onChange={(value) => handleAnswerChange(cqIndex, i, value)}
                          placeholder="উত্তর লিখুন"
                        />
                      </div>
                    ))}

                  {cqType === "mathCQ" &&
                    cq.mathQuestions.map((question, i) => (
                      <div key={i} className="mb-3">
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          {i === 0 ? "জ্ঞানমূলক প্রশ্ন" : i === 1 ? "প্রয়োগ প্রশ্ন" : "উচ্চতর দক্ষতা"}
                        </label>
                        <CustomEditor
                          value={question}
                          onChange={(value) => handleMathQuestionChange(cqIndex, i, value)}
                          placeholder={
                            i === 0
                              ? "জ্ঞানমূলক প্রশ্ন লিখুন"
                              : i === 1
                              ? "প্রয়োগ প্রশ্ন লিখুন"
                              : "উচ্চতর দক্ষতা প্রশ্ন লিখুন"
                          }
                        />
                        <label className="block text-gray-700 font-semibold mb-2 bangla-text">
                          উত্তর (ঐচ্ছিক)
                        </label>
                        <CustomEditor
                          value={cq.mathAnswers[i]}
                          onChange={(value) => handleMathAnswerChange(cqIndex, i, value)}
                          placeholder="উত্তর লিখুন"
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
                  className="w-full bg-green-600 text-white py-3 mt-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center shadow-md bangla-text"
                >
                  <span className="text-xl mr-2">+</span> নতুন সৃজনশীল প্রশ্ন যোগ করুন
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
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold text-blue-700 mb-4 bangla-text">প্রিভিউ</h2>
            {cqs.map((cq, cqIndex) => (
              <motion.div
                key={cqIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
              >
                <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2 bangla-text">
                  CQ
                </p>
                <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                  উদ্দীপক:
                </p>
                <div
                  className="text-gray-700 mb-4 bangla-text"
                  dangerouslySetInnerHTML={{
                    __html: serializeToHtml(cq.passage) || "অনুচ্ছেদ লিখুন",
                  }}
                />
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
                    className={`mb-4 ${
                      cq.imageAlignment === "left"
                        ? "text-left"
                        : cq.imageAlignment === "right"
                        ? "text-right"
                        : "text-center"
                    }`}
                  >
                    <img
                      src={URL.createObjectURL(cq.image)}
                      alt={`CQ preview ${cqIndex + 1}`}
                      className="rounded-lg shadow-md max-h-64 inline-block"
                    />
                  </div>
                )}
                <div className="text-gray-700">
                  {(cqType === "generalCQ" ? cq.questions : cq.mathQuestions).map(
                    (ques, i) => (
                      <div key={i} className="mb-2">
                        <p className="bangla-text">
                          {String.fromCharCode(2453 + i)}) <span
                            dangerouslySetInnerHTML={{
                              __html: serializeToHtml(ques) || "প্রশ্ন লিখুন",
                            }}
                          />{" "}
                          {cqType === "generalCQ"
                            ? `(${[1, 2, 3, 4][i]} নম্বর)`
                            : `(${[3, 3, 4][i]} নম্বর)`}
                        </p>
                        {(cqType === "generalCQ" ? cq.answers[i] : cq.mathAnswers[i]) && (
                          <p className="text-gray-600 ml-4 bangla-text">
                            <span className="font-semibold">উত্তর:</span>{" "}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: serializeToHtml(
                                  cqType === "generalCQ" ? cq.answers[i] : cq.mathAnswers[i]
                                ),
                              }}
                            />
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-3 bangla-text">
                  Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter:{" "}
                  {selectedChapterName || "N/A"} | Type: {cqType || "N/A"}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}