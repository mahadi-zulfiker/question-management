"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Search } from "lucide-react";
import { MathJax } from "better-react-mathjax";

// Process text for LaTeX conversion
const processTextForLatex = (text) => {
  if (!text) return "";
  // Handle fractions (e.g., "1/2" → "\frac{1}{2}")
  text = text.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  // Handle superscripts (e.g., "x^2" → "x^{2}")
  text = text.replace(/(\w+)\^(\d+)/g, "$1^{$2}");
  // Handle square roots (e.g., "sqrt(x)" → "\sqrt{x}")
  text = text.replace(/sqrt\((.*?)\)/g, "\\sqrt{$1}");
  // Handle common symbols
  text = text.replace(/≥/g, "\\geq");
  text = text.replace(/≤/g, "\\leq");
  text = text.replace(/≠/g, "\\neq");
  return text;
};

// Render markdown and LaTeX in preview
const renderLines = (text) => {
  if (!text) return "No content";

  try {
    let processedLine = processTextForLatex(text);
    if (processedLine.match(/[\\{}^_]/) && !processedLine.startsWith("$") && !processedLine.endsWith("$")) {
      processedLine = `$${processedLine}$`;
    }

    return (
      <MathJax>
        <span dangerouslySetInnerHTML={{ __html: processedLine }} />
      </MathJax>
    );
  } catch (error) {
    return (
      <span className="text-red-500">
        LaTeX Error: Invalid format
        <span className="text-gray-700 ml-2">{text}</span>
      </span>
    );
  }
};

export default function CreateExam() {
  const [examTitle, setExamTitle] = useState("");
  const [examType, setExamType] = useState("");
  const [duration, setDuration] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch("/api/exam/classes");
        const data = await response.json();
        if (response.ok) setClasses(data.classes || []);
        else toast.error(data.error || "❌ Failed to load classes!");
      } catch (error) {
        toast.error("❌ Error fetching classes!");
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!classNumber) {
      setSubjects([]);
      setChapters([]);
      setQuestions([]);
      setFilteredQuestions([]);
      setSelectedQuestions([]);
      return;
    }
    async function fetchSubjects() {
      try {
        const response = await fetch(`/api/exam/classes?classNumber=${classNumber}`);
        const data = await response.json();
        if (response.ok) {
          const uniqueSubjects = [...new Set(data.classes.map((c) => c.subject))];
          setSubjects(uniqueSubjects);
        } else toast.error(data.error || "❌ Failed to load subjects!");
      } catch (error) {
        toast.error("❌ Error fetching subjects!");
      }
    }
    fetchSubjects();
  }, [classNumber]);

  useEffect(() => {
    if (!classNumber || !subject) {
      setChapters([]);
      setQuestions([]);
      setFilteredQuestions([]);
      setSelectedQuestions([]);
      return;
    }
    async function fetchChapters() {
      try {
        const response = await fetch(`/api/exam/classes?classNumber=${classNumber}&subject=${subject}`);
        const data = await response.json();
        if (response.ok) {
          const uniqueChapters = [...new Set(data.classes.map((c) => c.chapterNumber))];
          setChapters(uniqueChapters);
        } else toast.error(data.error || "❌ Failed to load chapters!");
      } catch (error) {
        toast.error("❌ Error fetching chapters!");
      }
    }
    fetchChapters();
  }, [classNumber, subject]);

  useEffect(() => {
    if (!examType || !classNumber || !subject || !chapterNumber) {
      setQuestions([]);
      setFilteredQuestions([]);
      setSelectedQuestions([]);
      return;
    }
    async function fetchQuestions() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/exam/questions?type=${examType}&classNumber=${classNumber}&subject=${subject}&chapterNumber=${chapterNumber}`
        );
        const data = await response.json();
        if (response.ok) {
          const fetchedQuestions = Array.isArray(data.questions) ? data.questions : [];
          setQuestions(fetchedQuestions);
          setFilteredQuestions(fetchedQuestions);
        } else {
          toast.error(
            data.error ||
              `❌ No questions found for Class ${classNumber}, Subject ${subject}, Chapter ${chapterNumber}, Type ${examType}!`
          );
        }
      } catch (error) {
        toast.error("❌ Fetch error!");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [examType, classNumber, subject, chapterNumber]);

  useEffect(() => {
    const filtered = questions.filter((q) => {
      if (!q) return false;
      const query = searchQuery.toLowerCase();
      if (examType === "MCQ") return q.question?.toLowerCase().includes(query) || false;
      if (examType === "CQ") return q.passage?.toLowerCase().includes(query) || false;
      if (examType === "SQ") return q.question?.toLowerCase().includes(query) || false;
      return false;
    });
    setFilteredQuestions(filtered);
  }, [searchQuery, questions, examType]);

  const handleSelect = (question) => {
    setSelectedQuestions((prev) =>
      prev.some((q) => q._id === question._id)
        ? prev.filter((q) => q._id !== question._id)
        : [...prev, question]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) return toast.error("❌ Exam title is required!");
    if (!examType) return toast.error("❌ Exam type is required!");
    const parsedDuration = parseInt(duration);
    if (!duration || parsedDuration <= 0) return toast.error("❌ Duration must be a positive integer!");
    if (!classNumber) return toast.error("❌ Class is required!");
    if (!subject) return toast.error("❌ Subject is required!");
    if (!chapterNumber) return toast.error("❌ Chapter is required!");
    if (selectedQuestions.length === 0) return toast.error("❌ Select at least one question!");

    const examData = {
      title: examTitle,
      type: examType,
      duration: parsedDuration,
      classNumber,
      subject,
      chapterNumber,
      questions: selectedQuestions,
    };

    setSubmitting(true);
    try {
      const response = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "✅ Exam created successfully!");
        resetForm();
      } else {
        toast.error(data.error || "❌ Failed to create exam!");
      }
    } catch (error) {
      toast.error("❌ Submission error!");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setExamTitle("");
    setExamType("");
    setDuration("");
    setClassNumber("");
    setSubject("");
    setChapterNumber("");
    setQuestions([]);
    setFilteredQuestions([]);
    setSelectedQuestions([]);
    setSearchQuery("");
    // Reset dropdowns to initial state
    document.querySelectorAll("select").forEach((select) => (select.value = ""));
  };

  // Calculate total marks (assuming questions have a marks field)
  const calculateTotalMarks = () => {
    return selectedQuestions.reduce((total, q) => {
      if (examType === "MCQ") return total + (q.marks || 1); // Default to 1 if marks not specified
      if (examType === "CQ") return total + (q.marks || 10); // Default to 10 for CQ
      if (examType === "SQ") return total + (q.marks || 2); // Default to 2 for SQ
      return total;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {/* Banner Section */}
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            📝 Create Your Exam
          </h1>
        </div>
      </section>

      {/* Exam Creation Section */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 animate-fadeInUp">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter exam title"
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 60"
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all ${
                      duration && parseInt(duration) <= 0 ? "border-red-500" : "border-gray-200"
                    }`}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    required
                  />
                  {duration && parseInt(duration) <= 0 && (
                    <p className="text-red-500 text-sm mt-1">Duration must be a positive integer</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all"
                    value={classNumber}
                    onChange={(e) => setClassNumber(e.target.value)}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls.classNumber}>
                        Class {cls.classNumber} ({cls.level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all disabled:bg-gray-100"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    disabled={!classNumber}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Chapter <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all disabled:bg-gray-100"
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                    required
                    disabled={!subject}
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chap) => (
                      <option key={chap} value={chap}>
                        Chapter {chap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 transition-all"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  required
                >
                  <option value="">Select Exam Type</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="CQ">Creative Questions (CQ)</option>
                  <option value="SQ">Short Questions (SQ)</option>
                </select>
              </div>

              {examType && classNumber && subject && chapterNumber && (
                <div className="mt-10 bg-indigo-50 p-6 rounded-2xl shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-indigo-800">📚 Select Questions</h3>
                    <div className="flex space-x-4">
                      <div className="relative w-1/3">
                        <input
                          type="text"
                          placeholder="Search questions..."
                          className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white transition-all pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                  ) : filteredQuestions.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {filteredQuestions.map((q) => (
                        <div
                          key={q._id}
                          className="border border-indigo-200 p-5 rounded-xl bg-white hover:bg-indigo-50 transition-all shadow-md"
                        >
                          <label className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              onChange={() => handleSelect(q)}
                              checked={selectedQuestions.some((sel) => sel._id === q._id)}
                              className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                              {examType === "MCQ" && q.question && (
                                <>
                                  <p className="font-semibold text-gray-900">{renderLines(q.question)}</p>
                                  <ul className="list-disc ml-6 text-sm text-gray-700 mt-2">
                                    {Array.isArray(q.options) &&
                                      q.options.map((opt, idx) => (
                                        <li key={idx}>{renderLines(opt)}</li>
                                      ))}
                                  </ul>
                                </>
                              )}
                              {examType === "CQ" && q.passage && (
                                <>
                                  <p className="font-semibold text-gray-900">{renderLines(q.passage)}</p>
                                  <ul className="list-disc ml-6 text-sm text-gray-700 mt-2">
                                    {Array.isArray(q.questions) &&
                                      q.questions.map((cq, idx) => (
                                        <li key={idx}>{renderLines(cq)}</li>
                                      ))}
                                  </ul>
                                </>
                              )}
                              {examType === "SQ" && q.question && (
                                <p className="font-semibold text-gray-900">{renderLines(q.question)}</p>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-600 text-center py-6">❌ No questions found for this filter.</p>
                  )}
                </div>
              )}

              {selectedQuestions.length > 0 && (
                <div className="mt-10 bg-green-50 p-6 rounded-2xl shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-green-800">
                      👀 Selected Questions Preview ({selectedQuestions.length} questions)
                    </h3>
                    <p className="text-lg font-medium text-green-800">
                      Total Marks: {calculateTotalMarks()}
                    </p>
                  </div>
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedQuestions.map((q) => (
                      <div
                        key={q._id}
                        className="border border-green-200 p-5 rounded-xl bg-white shadow-md flex justify-between items-center"
                      >
                        <div>
                          {examType === "MCQ" && q.question && (
                            <p className="font-semibold text-gray-900">{renderLines(q.question)}</p>
                          )}
                          {examType === "CQ" && q.passage && (
                            <p className="font-semibold text-gray-900">{renderLines(q.passage)}</p>
                          )}
                          {examType === "SQ" && q.question && (
                            <p className="font-semibold text-gray-900">{renderLines(q.question)}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelect(q)}
                          className="text-red-600 text-sm font-medium hover:text-red-800 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 mt-10 rounded-xl hover:from-blue-600 hover:to-blue-800 transition-all font-semibold shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-1 flex items-center justify-center"
                disabled={loading || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Exam...
                  </>
                ) : (
                  "✅ Create Exam Now"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <Footer />
    </div>
  );
}