"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, AlertTriangle, PlusCircle, Trash2 } from "lucide-react";

const classes = Array.from({ length: 9 }, (_, i) => i + 4);
const levels = { 9: "SSC", 10: "SSC", 11: "HSC", 12: "HSC" };
const subjectParts = ["None", "1st", "2nd"];
const contentTypes = [
  "Examples",
  "Model Tests",
  "Admission Questions",
  "Practice Problems",
  "Theory",
  "Others",
];

export default function CreateClass() {
  const [classNumber, setClassNumber] = useState(4);
  const [subject, setSubject] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [subjectPart, setSubjectPart] = useState("None");
  const [contentType, setContentType] = useState("Theory");
  const [subChapters, setSubChapters] = useState([{ id: Date.now(), name: "" }]);

  const addSubChapter = () => {
    setSubChapters([...subChapters, { id: Date.now(), name: "" }]);
  };

  const removeSubChapter = (id) => {
    if (subChapters.length > 1) {
      setSubChapters(subChapters.filter((sub) => sub.id !== id));
    } else {
      toast.warn("At least one sub-chapter is required!", {
        icon: <AlertTriangle className="text-yellow-500" />,
      });
    }
  };

  const updateSubChapter = (id, value) => {
    setSubChapters(
      subChapters.map((sub) => (sub.id === id ? { ...sub, name: value } : sub))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !chapterNumber || !chapterName) {
      toast.error("Please fill in all required fields", {
        icon: <AlertTriangle className="text-red-500" />,
      });
      return;
    }
    if (chapterNumber <= 0) {
      toast.error("Chapter number must be positive", {
        icon: <AlertTriangle className="text-red-500" />,
      });
      return;
    }
    try {
      const res = await fetch("/api/createClass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classNumber,
          level: levels[classNumber] || null,
          subject,
          chapterNumber,
          chapterName,
          subjectPart,
          contentType,
          subChapters: subChapters.map((sub) => sub.name).filter((name) => name),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Class created successfully!", {
          icon: <CheckCircle className="text-green-500" />,
        });
        setSubject("");
        setChapterNumber("");
        setChapterName("");
        setSubjectPart("None");
        setContentType("Theory");
        setSubChapters([{ id: Date.now(), name: "" }]);
      } else {
        toast.error(data.message || "Something went wrong", {
          icon: <AlertTriangle className="text-red-500" />,
        });
      }
    } catch (error) {
      toast.error("Failed to create class: " + error.message, {
        icon: <AlertTriangle className="text-red-500" />,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Create New Class
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              value={classNumber}
              onChange={(e) => setClassNumber(Number(e.target.value))}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="Select class number"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls} {levels[cls] ? `(${levels[cls]})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="Enter subject name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Chapter Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                placeholder="e.g., 1"
                min="1"
                classёр

                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                aria-label="Enter chapter number"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Chapter Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="e.g., Algebra"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                aria-label="Enter chapter name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Subject Part
            </label>
            <select
              value={subjectPart}
              onChange={(e) => setSubjectPart(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="Select subject part"
            >
              {subjectParts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="Select content type"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sub-Chapters / Onoshilons (Optional)
            </label>
            {subChapters.map((sub, index) => (
              <div key={sub.id} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => updateSubChapter(sub.id, e.target.value)}
                  placeholder={`e.g., Exercise ${index + 1}.1`}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  aria-label={`Enter sub-chapter ${index + 1}`}
                />
                {subChapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubChapter(sub.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                    aria-label="Remove sub-chapter"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSubChapter}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              aria-label="Add another sub-chapter"
            >
              <PlusCircle size={20} className="mr-2" /> Add Sub-Chapter
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
          >
            Create Class
          </button>
        </form>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </div>
    </div>
  );
}