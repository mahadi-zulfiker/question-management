"use client";

import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Head from "next/head";
import dynamic from "next/dynamic";
import { marked } from "marked";
import DOMPurify from "dompurify";
import FormatToolbar from "../../../FormatToolbar/index";

const MathJax = dynamic(() => import("better-react-mathjax").then((mod) => mod.MathJax), { ssr: false });

// Normalize text to Unicode NFC
const normalizeText = (text) => {
  return text
    .normalize("NFC")
    .replace(/[\u200B-\u200F\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Process text for LaTeX conversion
const processTextForLatex = (text) => {
  if (!text || typeof text !== "string") return "";

  try {
    text = normalizeText(text);

    // Protect LaTeX and markdown
    const placeholders = [];
    let placeholderIndex = 0;
    text = text.replace(/(\*\*.*?\*\*|\*.*?\*|__.*?__|\$.*?\$)/g, (match) => {
      placeholders.push(match);
      return `__PLACEHOLDER_${placeholderIndex++}__`;
    });

    // Convert fractions
    text = text.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, whole, num, denom) => {
      if (denom === "0") return match;
      return `${whole} \\frac{${num}}{${denom}}`;
    });
    text = text.replace(/(\d+)\/(\d+)/g, (match, num, denom) => {
      if (denom === "0") return match;
      return `\\frac{${num}}{${denom}}`;
    });

    // Convert exponents and symbols
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

    // Handle Bangla text
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

    // Separate numbers from Bangla
    text = text.replace(/([০-৯]+)([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ]+)/g, "$1 $2");
    text = text.replace(/([ক-ঢ়ঁ-ঃা-ৄে-ৈো-ৌ]+)([০-৯]+)/g, "$1 $2");

    // Restore placeholders
    text = text.replace(/__PLACEHOLDER_(\d+)__/g, (_, i) => placeholders[i]);

    return text;
  } catch (error) {
    console.error("LaTeX processing error:", error);
    return text;
  }
};

// Render markdown and LaTeX
const renderLines = (text, inline = false) => {
  if (!text || typeof text !== "string") {
    return <span className="bangla-text">প্রশ্ন বা উত্তর লিখুন...</span>;
  }

  try {
    const lines = text.split("\n");
    const processedLines = lines.map((line) => {
      let processedLine = normalizeText(line);
      const html = marked(processedLine, { breaks: true });
      const sanitizedHtml = DOMPurify.sanitize(html);
      const hasLatex = processedLine.match(/[\\{}^_]|\\frac|\\sqrt|\\geq|\\leq|\\neq/);
      const content = <span dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
      return hasLatex ? <MathJax dynamic>{content}</MathJax> : content;
    });

    if (inline) {
      return <span className="bangla-text">{processedLines}</span>;
    }
    return processedLines.map((line, index) => (
      <div key={index} className="bangla-text">
        {line}
      </div>
    ));
  } catch (error) {
    console.error("Rendering error:", error);
    return <span className="text-red-500 bangla-text">ত্রুটি: অসম্পূর্ণ ফরম্যাট।</span>;
  }
};

export default function ViewQuestionsAdmin() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [editingCQ, setEditingCQ] = useState(null);
  const [editingSQ, setEditingSQ] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const textareaRefs = useRef({});

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/questions?type=${type}&search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data || []);
        } else {
          toast.error("প্রশ্ন লোড করতে ব্যর্থ!");
        }
      } catch (error) {
        toast.error("সার্ভার ত্রুটি!");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [type, search]);

  const handleDelete = async (id, type) => {
    if (!confirm(`আপনি কি এই ${type === "mcq" ? "এমসিকিউ" : type === "cq" ? "সৃজনশীল প্রশ্ন" : "সংক্ষিপ্ত প্রশ্ন"} মুছতে চান?`)) return;
    try {
      const response = await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok) {
        toast.success(`${type.toUpperCase()} মুছে ফেলা হয়েছে!`);
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } else {
        toast.error(`ত্রুটি: ${data.error || `${type.toUpperCase()} মুছতে ব্যর্থ`}`);
      }
    } catch (error) {
      toast.error("সার্ভার ত্রুটি!");
    }
  };

  const saveEditMCQ = async (updatedMCQ) => {
    try {
      const processedMCQ = {
        ...updatedMCQ,
        question: processTextForLatex(updatedMCQ.question),
        options: updatedMCQ.options.map((opt) => processTextForLatex(opt)),
      };
      const response = await fetch(`/api/mcq/${updatedMCQ._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedMCQ),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("এমসিকিউ আপডেট করা হয়েছে!");
        setQuestions((prev) => prev.map((q) => (q._id === updatedMCQ._id ? processedMCQ : q)));
        setEditingMCQ(null);
      } else {
        toast.error(`ত্রুটি: ${data.error || "এমসিকিউ আপডেট ব্যর্থ"}`);
      }
    } catch (error) {
      toast.error("সার্ভার ত্রুটি!");
    }
  };

  const saveEditCQ = async (updatedCQ) => {
    try {
      const processedCQ = {
        ...updatedCQ,
        passage: processTextForLatex(updatedCQ.passage),
        questions: updatedCQ.questions.map((q) => processTextForLatex(q)),
      };
      const response = await fetch(`/api/cq/${updatedCQ._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedCQ),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("সৃজনশীল প্রশ্ন আপডেট করা হয়েছে!");
        setQuestions((prev) => prev.map((q) => (q._id === updatedCQ._id ? processedCQ : q)));
        setEditingCQ(null);
      } else {
        toast.error(`ত্রুটি: ${data.error || "সৃজনশীল প্রশ্ন আপডেট ব্যর্�th"}`);
      }
    } catch (error) {
      toast.error("সার্ভার ত্রুটি!");
    }
  };

  const saveEditSQ = async (updatedSQ) => {
    try {
      const processedSQ = {
        ...updatedSQ,
        question: processTextForLatex(updatedSQ.question),
        answer: processTextForLatex(updatedSQ.answer || ""),
      };
      const response = await fetch(`/api/sq/${updatedSQ._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedSQ),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("সংক্ষিপ্ত প্রশ্ন আপডেট করা হয়েছে!");
        setQuestions((prev) => prev.map((q) => (q._id === updatedSQ._id ? processedSQ : q)));
        setEditingSQ(null);
      } else {
        toast.error(`ত্রুটি: ${data.error || "সংক্ষিপ্ত প্রশ্ন আপডেট ব্যর্থ"}`);
      }
    } catch (error) {
      toast.error("সার্ভার ত্রুটি!");
    }
  };

  const handleSelection = (modalType, fieldType, index, e) => {
    const textarea = textareaRefs.current[`${modalType}-${fieldType}-${index ?? ""}`];
    if (!textarea) return;

    const selection = window.getSelection();
    if (!selection.rangeCount || !selection.toString()) {
      setToolbarPosition(null);
      setActiveField(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbarPosition({ x: rect.left, y: rect.top - 40 });
    setActiveField({ modalType, fieldType, index });
  };

  const handleFormat = (format) => {
    if (!activeField) return;

    const { modalType, fieldType, index } = activeField;
    const textarea = textareaRefs.current[`${modalType}-${fieldType}-${index ?? ""}`];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    if (!selectedText) return;

    let formattedText;
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
      default:
        return;
    }

    const updatedText = text.substring(0, start) + formattedText + text.substring(end);

    if (modalType === "mcq") {
      if (fieldType === "question") {
        setEditingMCQ((prev) => ({ ...prev, question: updatedText }));
      } else if (fieldType === "option") {
        setEditingMCQ((prev) => {
          const newOptions = [...prev.options];
          newOptions[index] = updatedText;
          return { ...prev, options: newOptions };
        });
      }
    } else if (modalType === "cq") {
      if (fieldType === "passage") {
        setEditingCQ((prev) => ({ ...prev, passage: updatedText }));
      } else if (fieldType === "question") {
        setEditingCQ((prev) => {
          const newQuestions = [...prev.questions];
          newQuestions[index] = updatedText;
          return { ...prev, questions: newQuestions };
        });
      }
    } else if (modalType === "sq") {
      if (fieldType === "question") {
        setEditingSQ((prev) => ({ ...prev, question: updatedText }));
      } else if (fieldType === "answer") {
        setEditingSQ((prev) => ({ ...prev, answer: updatedText }));
      }
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  function EditMCQModal({ question, onCancel, onSave }) {
    const [editedMCQ, setEditedMCQ] = useState(question);

    useEffect(() => {
      setEditedMCQ(question);
    }, [question]);

    const handleOptionChange = (index, value) => {
      const newOptions = [...editedMCQ.options];
      newOptions[index] = value;
      setEditedMCQ({ ...editedMCQ, options: newOptions });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(editedMCQ);
    };

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4 text-blue-600 bangla-text">✏️ এমসিকিউ সম্পাদনা</h3>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">প্রশ্ন</label>
              <textarea
                value={editedMCQ.question || ""}
                onChange={(e) => setEditedMCQ({ ...editedMCQ, question: e.target.value })}
                onSelect={(e) => handleSelection("mcq", "question", null, e)}
                className="w-full p-3 border rounded bangla-text"
                rows={4}
                placeholder="প্রশ্ন লিখুন"
                ref={(el) => (textareaRefs.current["mcq-question-"] = el)}
                required
              />
              <FormatToolbar
                position={toolbarPosition && activeField?.modalType === "mcq" && activeField?.fieldType === "question" ? toolbarPosition : null}
                onFormat={handleFormat}
              />
              <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                <strong>প্রিভিউ:</strong> {renderLines(editedMCQ.question || "প্রশ্ন লিখুন...")}
              </div>
            </div>
            {(editedMCQ.options || []).map((opt, i) => (
              <div key={i} className="flex items-center mb-4 relative">
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2 bangla-text">{`বিকল্প ${i + 1}`}</label>
                  <textarea
                    value={opt || ""}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    onSelect={(e) => handleSelection("mcq", "option", i, e)}
                    className="w-full p-2 border rounded bangla-text"
                    rows={2}
                    placeholder={`বিকল্প ${i + 1}`}
                    ref={(el) => (textareaRefs.current[`mcq-option-${i}`] = el)}
                    required
                  />
                  <FormatToolbar
                    position={toolbarPosition && activeField?.modalType === "mcq" && activeField?.fieldType === "option" && activeField?.index === i ? toolbarPosition : null}
                    onFormat={handleFormat}
                  />
                  <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                    <strong>প্রিভিউ:</strong> {renderLines(opt || "বিকল্প লিখুন...", true)}
                  </div>
                </div>
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={editedMCQ.correctAnswer === i}
                  onChange={() => setEditedMCQ({ ...editedMCQ, correctAnswer: i })}
                  className="ml-2 self-start mt-10"
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">ভিডিও লিঙ্ক (ঐচ্ছিক)</label>
              <input
                type="url"
                value={editedMCQ.videoLink || ""}
                onChange={(e) => setEditedMCQ({ ...editedMCQ, videoLink: e.target.value })}
                className="w-full p-2 border rounded bangla-text"
                placeholder="উদাহরণ: https://drive.google.com/..."
              />
            </div>
            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition bangla-text">
                সংরক্ষণ
              </button>
              <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition bangla-text">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function EditCQModal({ question, onCancel, onSave }) {
    const [editedCQ, setEditedCQ] = useState(question);

    useEffect(() => {
      setEditedCQ(question);
    }, [question]);

    const handleQuestionChange = (index, value) => {
      const newQuestions = [...editedCQ.questions];
      newQuestions[index] = value;
      setEditedCQ({ ...editedCQ, questions: newQuestions });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(editedCQ);
    };

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4 text-blue-600 bangla-text">✏️ সৃজনশীল প্রশ্ন সম্পাদনা</h3>
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">উদ্দীপক</label>
              <textarea
                value={editedCQ.passage || ""}
                onChange={(e) => setEditedCQ({ ...editedCQ, passage: e.target.value })}
                onSelect={(e) => handleSelection("cq", "passage", null, e)}
                className="w-full p-3 border rounded bangla-text"
                rows={4}
                placeholder="উদ্দীপক"
                ref={(el) => (textareaRefs.current["cq-passage-"] = el)}
                required
              />
              <FormatToolbar
                position={toolbarPosition && activeField?.modalType === "cq" && activeField?.fieldType === "passage" ? toolbarPosition : null}
                onFormat={handleFormat}
              />
              <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                <strong>প্রিভিউ:</strong> {renderLines(editedCQ.passage || "উদ্দীপক লিখুন...")}
              </div>
            </div>
            {(editedCQ.questions || []).map((q, i) => (
              <div key={i} className="relative mb-4">
                <label className="block text-gray-700 font-semibold mb-2 bangla-text">{`প্রশ্ন ${i + 1}`}</label>
                <textarea
                  value={q || ""}
                  onChange={(e) => handleQuestionChange(i, e.target.value)}
                  onSelect={(e) => handleSelection("cq", "question", i, e)}
                  className="w-full p-2 border rounded bangla-text"
                  rows={3}
                  placeholder={`প্রশ্ন ${i + 1}`}
                  ref={(el) => (textareaRefs.current[`cq-question-${i}`] = el)}
                  required
                />
                <FormatToolbar
                  position={toolbarPosition && activeField?.modalType === "cq" && activeField?.fieldType === "question" && activeField?.index === i ? toolbarPosition : null}
                  onFormat={handleFormat}
                />
                <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                  <strong>প্রিভিউ:</strong> {renderLines(q || "প্রশ্ন লিখুন...")}
                </div>
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">ভিডিও লিঙ্ক (ঐচ্ছিক)</label>
              <input
                type="url"
                value={editedCQ.videoLink || ""}
                onChange={(e) => setEditedCQ({ ...editedCQ, videoLink: e.target.value })}
                className="w-full p-2 border rounded bangla-text"
                placeholder="উদাহরণ: https://drive.google.com/..."
              />
            </div>
            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition bangla-text">
                সংরক্ষণ
              </button>
              <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition bangla-text">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function EditSQModal({ question, onCancel, onSave }) {
    const [editedSQ, setEditedSQ] = useState(question);

    useEffect(() => {
      setEditedSQ(question);
    }, [question]);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(editedSQ);
    };

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4 text-blue-600 bangla-text">✏️ সংক্ষিপ্ত প্রশ্ন সম্পাদনা</h3>
          <form onSubmit={handleSubmit}>
            <select
              value={editedSQ.type || "জ্ঞানমূলক"}
              onChange={(e) => setEditedSQ({ ...editedSQ, type: e.target.value })}
              className="w-full p-2 border rounded mb-4 bangla-text"
              required
            >
              <option value="জ্ঞানমূলক">জ্ঞানমূলক</option>
              <option value="অনুধাবনমূলক">অনুধাবনমূলক</option>
              <option value="প্রয়োগমূলক">প্রয়োগমূলক</option>
              <option value="উচ্চতর দক্ষতা">উচ্চতর দক্ষতা</option>
            </select>
            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">প্রশ্ন</label>
              <textarea
                value={editedSQ.question || ""}
                onChange={(e) => setEditedSQ({ ...editedSQ, question: e.target.value })}
                onSelect={(e) => handleSelection("sq", "question", null, e)}
                className="w-full p-3 border rounded bangla-text"
                rows={4}
                placeholder="প্রশ্ন লিখুন"
                ref={(el) => (textareaRefs.current["sq-question-"] = el)}
                required
              />
              <FormatToolbar
                position={toolbarPosition && activeField?.modalType === "sq" && activeField?.fieldType === "question" ? toolbarPosition : null}
                onFormat={handleFormat}
              />
              <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                <strong>প্রিভিউ:</strong> {renderLines(editedSQ.question || "প্রশ্ন লিখুন...")}
              </div>
            </div>
            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">উত্তর (ঐচ্ছিক)</label>
              <textarea
                value={editedSQ.answer || ""}
                onChange={(e) => setEditedSQ({ ...editedSQ, answer: e.target.value })}
                onSelect={(e) => handleSelection("sq", "answer", null, e)}
                className="w-full p-3 border rounded bangla-text"
                rows={4}
                placeholder="উত্তর (ঐচ্ছিক)"
                ref={(el) => (textareaRefs.current["sq-answer-"] = el)}
              />
              <FormatToolbar
                position={toolbarPosition && activeField?.modalType === "sq" && activeField?.fieldType === "answer" ? toolbarPosition : null}
                onFormat={handleFormat}
              />
              <div className="mt-2 p-3 bg-gray-100 border rounded bangla-text">
                <strong>প্রিভিউ:</strong> {renderLines(editedSQ.answer || "উত্তর লিখুন...")}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2 bangla-text">ভিডিও লিঙ্ক (ঐচ্ছিক)</label>
              <input
                type="url"
                value={editedSQ.videoLink || ""}
                onChange={(e) => setEditedSQ({ ...editedSQ, videoLink: e.target.value })}
                className="w-full p-2 border rounded bangla-text"
                placeholder="উদাহরণ: https://drive.google.com/..."
              />
            </div>
            <div className="flex justify-between mt-4">
              <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition bangla-text">
                সংরক্ষণ
              </button>
              <button type="button" onClick={onCancel} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition bangla-text">
                বাতিল
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <style>{`
          .bangla-text {
            font-family: 'Noto Sans Bengali', 'Kalpurush', sans-serif;
          }
          .video-link {
            color: #1a73e8;
            text-decoration: underline;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            border-radius: 0.375rem;
          }
          .video-link:hover {
            background-color: #e8f0fe;
          }
          textarea.bangla-text {
            min-height: 80px;
            white-space: pre-wrap;
            padding: 12px;
            font-size: 16px;
            line-height: 1.6;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
          }
          textarea.bangla-text:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          .option-row {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
          }
          .option-designation {
            flex-shrink: 0;
            width: 1.5rem;
          }
        `}</style>
      </Head>
      <MathJax>
        <div className="p-6 max-w-5xl mx-auto bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
          <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 bangla-text">📚 প্রশ্ন দেখুন</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full md:w-1/3 p-3 border rounded-lg bg-white shadow-sm bangla-text"
            >
              <option value="">সব প্রশ্ন</option>
              <option value="mcq">এমসিকিউ</option>
              <option value="cq">সৃজনশীল প্রশ্ন</option>
              <option value="sq">সংক্ষিপ্ত প্রশ্ন</option>
            </select>
            <input
              type="text"
              placeholder="🔍 প্রশ্ন খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-2/3 p-3 border rounded-lg bg-white shadow-sm bangla-text"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {questions.length > 0 ? (
                questions.map((q) => (
                  <div key={q._id} className="border p-6 rounded-lg shadow-md bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded bangla-text">{q.type.toUpperCase()}</span>
                      <div className="space-x-2">
                        <button
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition bangla-text"
                          onClick={() => (q.type === "mcq" ? setEditingMCQ(q) : q.type === "cq" ? setEditingCQ(q) : setEditingSQ(q))}
                        >
                          ✏️ সম্পাদনা
                        </button>
                        <button
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition bangla-text"
                          onClick={() => handleDelete(q._id, q.type)}
                        >
                          🗑️ মুছুন
                        </button>
                      </div>
                    </div>

                    {q.type === "mcq" && (
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">প্রশ্ন: {renderLines(q.question || "প্রশ্ন নেই")}</p>
                        {q.imageId && (
                          <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                            <img
                              src={`/api/image/${q.imageId}?type=mcq`}
                              alt="MCQ visual"
                              className="rounded max-h-48 inline-block"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          </div>
                        )}
                        {q.videoLink && (
                          <div className="mb-4">
                            <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                              📹 ভিডিও দেখুন
                            </a>
                          </div>
                        )}
                        {(q.options || []).length === 4 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            {(q.options || []).map((opt, i) => (
                              <div key={i} className={`option-row bangla-text ${q.correctAnswer === i ? "font-bold text-green-600" : "text-gray-700"}`}>
                                <span className="option-designation">{String.fromCharCode(2453 + i)}.</span>
                                <span>{renderLines(opt || "N/A", true)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <div className="mb-3 text-gray-700">
                              {(q.options || []).slice(0, 3).map((opt, i) => (
                                <div key={i} className="option-row bangla-text">
                                  <span className="option-designation">{String.fromCharCode(2453 + i)}.</span>
                                  <span>{renderLines(opt || "N/A", true)}</span>
                                </div>
                              ))}
                            </div>
                            <p className="font-bold mb-2 bangla-text">নিচের কোনটি সঠিক?</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {(q.options || []).slice(3).map((opt, i) => (
                                <div key={i + 3} className={`option-row bangla-text ${q.correctAnswer === i + 3 ? "font-bold text-green-600" : "text-gray-700"}`}>
                                  <span className="option-designation">{String.fromCharCode(2453 + i)}.</span>
                                  <span>{renderLines(opt || "N/A", true)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-4 bangla-text">
                          ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়: {q.chapterName || "N/A"} | ধরণ: {q.questionType || "N/A"}
                        </p>
                      </div>
                    )}

                    {q.type === "cq" && (
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">উদ্দীপক:</p>
                        <div className="text-gray-700 mb-4 bangla-text">{renderLines(q.passage || "কোনো উদ্দীপক নেই")}</div>
                        {q.imageId && (
                          <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                            <img
                              src={`/api/image/${q.imageId}?type=cq`}
                              alt="CQ visual"
                              className="rounded max-h-64 inline-block"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          </div>
                        )}
                        {q.videoLink && (
                          <div className="mb-4">
                            <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                              📹 ভিডিও দেখুন
                            </a>
                          </div>
                        )}
                        <div className="text-gray-900">
                          {(q.questions || []).map((ques, i) => (
                            <p key={i} className="mb-2 bangla-text">
                              {String.fromCharCode(2453 + i)}) {renderLines(ques || "N/A")} {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                            </p>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-4 bangla-text">
                          ক্লাস: {q.classNumber || "N/A"} | বিষয়: {q.subject || "N/A"} | অধ্যায়: {q.chapterName || "N/A"} | ধরণ: {q.cqType || "N/A"}
                        </p>
                      </div>
                    )}

                    {q.type === "sq" && (
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2 bangla-text">
                          প্রশ্ন ({q.type}): {renderLines(q.question || "প্রশ্ন নেই")}
                        </p>
                        {q.imageId && (
                          <div className={`mb-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                            <img
                              src={`/api/image/${q.imageId}?type=sq`}
                              alt="SQ visual"
                              className="rounded max-h-48 inline-block"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          </div>
                        )}
                        {q.videoLink && (
                          <div className="mb-4">
                            <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                              📹 ভিডিও দেখুন
                            </a>
                          </div>
                        )}
                        {q.answer && (
                          <p className="text-gray-700 mb-4 bangla-text">
                            <span className="font-semibold">উত্তর:</span> {renderLines(q.answer || "N/A")}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-4 bangla-text">
                          ক্লাস: {q.classLevel || "N/A"} | বিষয়: {q.subjectName || "N/A"} | অধ্যায়: {q.chapterName || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 italic py-6 bangla-text">কোনো প্রশ্ন পাওয়া যায়নি।</p>
              )}
            </div>
          )}

          {editingMCQ && <EditMCQModal question={editingMCQ} onCancel={() => setEditingMCQ(null)} onSave={saveEditMCQ} />}
          {editingCQ && <EditCQModal question={editingCQ} onCancel={() => setEditingCQ(null)} onSave={saveEditCQ} />}
          {editingSQ && <EditSQModal question={editingSQ} onCancel={() => setEditingSQ(null)} onSave={saveEditSQ} />}
        </div>
      </MathJax>
    </>
  );
}