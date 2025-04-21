"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const EditableMathField = dynamic(() => import("react-mathquill").then((mod) => mod.EditableMathField), { ssr: false });
const StaticMathField = dynamic(() => import("react-mathquill").then((mod) => mod.StaticMathField), { ssr: false });

export default function SubjectsList() {
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState({ mcqs: [], cqs: [], sqs: [] });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectStates, setSubjectStates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Load MathQuill styles
  useEffect(() => {
    (async () => {
      const { addStyles } = await import("react-mathquill");
      addStyles();
    })();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/createQuestionBank");
      const data = await res.json();
      if (res.ok) {
        setClasses(data.classes);
        setQuestions({ mcqs: data.mcqs, cqs: data.cqs, sqs: data.sqs });
        const classNumbers = [...new Set(data.classes.map((cls) => cls.classNumber))].sort((a, b) => a - b);
        if (classNumbers.length > 0) {
          setSelectedClass(classNumbers[0].toString());
          const subjectsForClass = data.classes.filter((cls) => cls.classNumber === classNumbers[0]);
          if (subjectsForClass.length > 0) {
            setSelectedSubject(subjectsForClass[0].subject);
          }
        }
      } else {
        toast.error("ডেটা লোড করতে ব্যর্থ!");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("সার্ভার ত্রুটি!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered questions when class or subject changes
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchFilteredQuestions();
    }
  }, [selectedClass, selectedSubject]);

  const fetchFilteredQuestions = async () => {
    setLoading(true);
    try {
      const url = `/api/createQuestionBank?class=${selectedClass}&subject=${selectedSubject}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setQuestions({ mcqs: data.mcqs, cqs: data.cqs, sqs: data.sqs });
      } else {
        toast.error("ফিল্টার করা প্রশ্ন লোড করতে ব্যর্থ!");
      }
    } catch (error) {
      console.error("Error fetching filtered questions:", error);
      toast.error("সার্ভার ত্রুটি!");
    } finally {
      setLoading(false);
    }
  };

  // Toggle individual subject
  const toggleSubject = (id) => {
    setSubjectStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get unique class numbers and subjects
  const classNumbers = [...new Set(classes.map((cls) => cls.classNumber))].sort((a, b) => a - b);
  const subjects = [...new Set(classes.filter((cls) => cls.classNumber === parseInt(selectedClass)).map((cls) => cls.subject))];

  // Filter subjects based on selected class and search term
  const filteredSubjects = classes
    .filter((cls) => cls.classNumber === parseInt(selectedClass))
    .filter(
      (cls) =>
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.chapterName && cls.chapterName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Helper to get questions for a specific subject and class
  const getQuestionsForSubject = (subject) => {
    const classNum = parseInt(selectedClass);
    return {
      mcqs: questions.mcqs.filter((q) => q.classNumber === classNum && q.subject === subject),
      cqs: questions.cqs.filter((q) => q.classNumber === classNum && q.subject === subject),
      sqs: questions.sqs.filter((q) => q.classLevel === classNum && q.subjectName === subject),
    };
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet" />
        <style>{`
          .bangla-text {
            font-family: 'Noto Sans Bengali', sans-serif;
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
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        {/* Banner Section */}
        <section className="relative py-24 bg-gradient-to-r from-blue-800 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,128C672,107,768,117,864,138.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold bangla-text">
              একাডেমিক বিষয়সমূহ
            </h1>
            <p className="mt-4 text-lg md:text-xl bangla-text">
              আপনার শিক্ষার জন্য সেরা সম্পদ এখানে!
            </p>
            <div className="mt-8 max-w-md mx-auto relative">
              <input
                type="text"
                placeholder="বিষয় বা অধ্যায় খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 rounded-full bg-white/90 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-md bangla-text"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>
        </section>

        {/* Filters and Subjects List */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <select
                className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const firstSubject = classes.find((cls) => cls.classNumber === parseInt(e.target.value))?.subject || "";
                  setSelectedSubject(firstSubject);
                  setSubjectStates({});
                  setSearchTerm("");
                }}
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
                {classNumbers.map((classNum) => (
                  <option key={classNum} value={classNum}>
                    ক্লাস {classNum}
                  </option>
                ))}
              </select>
              <select
                className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm bangla-text"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSubjectStates({});
                  setSearchTerm("");
                }}
              >
                <option value="">বিষয় নির্বাচন করুন</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Subjects List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((cls, index) => {
                    const subjectQuestions = getQuestionsForSubject(cls.subject);
                    return (
                      <div
                        key={cls._id}
                        className="border border-gray-200 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300"
                        style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                      >
                        <div
                          className="flex justify-between items-center mb-4 cursor-pointer"
                          onClick={() => toggleSubject(cls._id)}
                        >
                          <h2 className="text-xl font-semibold text-blue-700 bangla-text">
                            {cls.subject} (ক্লাস {cls.classNumber})
                          </h2>
                          <span className="text-blue-600">
                            {subjectStates[cls._id] ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                          </span>
                        </div>
                        {subjectStates[cls._id] && (
                          <div className="space-y-6">
                            {/* MCQs */}
                            {subjectQuestions.mcqs.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 bangla-text">এমসিকিউ</h3>
                                {subjectQuestions.mcqs.map((q, idx) => (
                                  <div key={q._id} className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-300">
                                    <p className="text-base font-medium text-gray-900 bangla-text">
                                      প্রশ্ন {idx + 1}: <StaticMathField>{q.question || "প্রশ্ন নেই"}</StaticMathField>
                                    </p>
                                    {q.imageId && (
                                      <div className={`my-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                        <img
                                          src={`/api/image/${q.imageId}?type=mcq`}
                                          alt="MCQ visual"
                                          className="rounded shadow-md max-h-48 inline-block"
                                          onError={(e) => (e.target.style.display = "none")}
                                        />
                                      </div>
                                    )}
                                    {q.videoLink && (
                                      <div className="my-2">
                                        <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                                          📹 ভিডিও দেখুন
                                        </a>
                                      </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                      {(q.options || []).map((opt, i) => (
                                        <p
                                          key={i}
                                          className={`text-gray-700 bangla-text ${q.correctOption === i ? "font-bold text-green-600" : ""}`}
                                        >
                                          {String.fromCharCode(2453 + i)}. <StaticMathField>{opt || "N/A"}</StaticMathField>
                                        </p>
                                      ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 bangla-text">
                                      অধ্যায়: {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.questionType || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* CQs */}
                            {subjectQuestions.cqs.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 bangla-text">সৃজনশীল প্রশ্ন</h3>
                                {subjectQuestions.cqs.map((q, idx) => (
                                  <div key={q._id} className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-300">
                                    <p className="text-base font-medium text-gray-900 mb-2 bangla-text">
                                      উদ্দীপক: <StaticMathField>{q.passage || "কোনো উদ্দীপক নেই"}</StaticMathField>
                                    </p>
                                    {q.imageId && (
                                      <div className={`my-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                        <img
                                          src={`/api/image/${q.imageId}?type=cq`}
                                          alt="CQ visual"
                                          className="rounded shadow-md max-h-64 inline-block"
                                          onError={(e) => (e.target.style.display = "none")}
                                        />
                                      </div>
                                    )}
                                    {q.videoLink && (
                                      <div className="my-2">
                                        <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                                          📹 ভিডিও দেখুন
                                        </a>
                                      </div>
                                    )}
                                    {(q.questions || []).map((ques, i) => (
                                      <p key={i} className="text-gray-700 mb-2 bangla-text">
                                        {String.fromCharCode(2453 + i)}) <StaticMathField>{ques || "N/A"}</StaticMathField> {q.marks && q.marks[i] ? `(${q.marks[i]} নম্বর)` : ""}
                                      </p>
                                    ))}
                                    <p className="text-sm text-gray-500 mt-2 bangla-text">
                                      অধ্যায়: {q.chapterName || "N/A"} | প্রশ্নের ধরণ: {q.cqType || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* SQs */}
                            {subjectQuestions.sqs.length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 bangla-text">সংক্ষিপ্ত প্রশ্ন</h3>
                                {subjectQuestions.sqs.map((q, idx) => (
                                  <div key={q._id} className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-300">
                                    <p className="text-base font-medium text-gray-900 mb-2 bangla-text">
                                      প্রশ্ন ({q.type || "জ্ঞানমূলক"}): <StaticMathField>{q.question || "প্রশ্ন নেই"}</StaticMathField>
                                    </p>
                                    {q.imageId && (
                                      <div className={`my-4 ${q.imageAlignment === "left" ? "text-left" : q.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                        <img
                                          src={`/api/image/${q.imageId}?type=sq`}
                                          alt="SQ visual"
                                          className="rounded shadow-md max-h-48 inline-block"
                                          onError={(e) => (e.target.style.display = "none")}
                                        />
                                      </div>
                                    )}
                                    {q.videoLink && (
                                      <div className="my-2">
                                        <a href={q.videoLink} target="_blank" rel="noopener noreferrer" className="video-link bangla-text">
                                          📹 ভিডিও দেখুন
                                        </a>
                                      </div>
                                    )}
                                    {q.answer && (
                                      <p className="text-gray-700 mb-2 bangla-text">
                                        <span className="font-semibold">উত্তর:</span> <StaticMathField>{q.answer || "N/A"}</StaticMathField>
                                      </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2 bangla-text">
                                      অধ্যায়: {q.chapterName || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {subjectQuestions.mcqs.length === 0 &&
                              subjectQuestions.cqs.length === 0 &&
                              subjectQuestions.sqs.length === 0 && (
                                <p className="text-gray-500 text-lg bangla-text">
                                  এই বিষয়ের জন্য কোনো প্রশ্ন পাওয়া যায়নি।
                                </p>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-lg p-10 bg-white rounded-lg shadow-md bangla-text">
                    কোনো ফলাফল পাওয়া যায়নি।
                  </div>
                )}
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-16 text-center">
              <p className="text-gray-700 mb-6 text-xl font-medium bangla-text">
                আজই শুরু করুন আপনার শিক্ষা—ফ্রি রিসোর্স পান!
              </p>
              <a
                href="/signUp"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300 bangla-text"
              >
                রেজিস্ট্রেশন করুন
              </a>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}