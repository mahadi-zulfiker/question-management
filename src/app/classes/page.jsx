"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function SubjectsList() {
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState({ mcqs: [], cqs: [], sqs: [] });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectStates, setSubjectStates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
        toast.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
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
        toast.error("Failed to fetch filtered questions");
      }
    } catch (error) {
      console.error("Error fetching filtered questions:", error);
      toast.error("Error fetching filtered questions");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {/* Banner Section */}
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            একাডেমিক বিষয়সমূহ
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200 mt-6 drop-shadow-md">
            আপনার শিক্ষার জন্য সর্বোত্তম গাইড!
          </p>
          <div className="mt-10 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="বিষয় বা অধ্যায় খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-5 pl-14 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            />
            <span className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <Search className="w-6 h-6 text-gray-400" />
            </span>
          </div>
        </div>
      </section>

      {/* Filters and Subjects List */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {/* Filters */}
          <div className="mb-12 flex flex-col md:flex-row gap-6 items-center">
            <select
              className="w-full md:w-1/3 p-4 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
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
              className="w-full md:w-1/3 p-4 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
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
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((cls, index) => {
                  const subjectQuestions = getQuestionsForSubject(cls.subject);
                  return (
                    <div
                      key={cls._id}
                      className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className="p-6 flex justify-between items-center text-2xl font-semibold text-gray-800 cursor-pointer"
                        onClick={() => toggleSubject(cls._id)}
                      >
                        <span>{cls.subject} (ক্লাস {cls.classNumber})</span>
                        <span className="text-blue-600">
                          {subjectStates[cls._id] ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
                        </span>
                      </div>
                      {subjectStates[cls._id] && (
                        <div className="p-6 pt-0 space-y-4">
                          {/* MCQs */}
                          {subjectQuestions.mcqs.map((q, idx) => (
                            <div
                              key={q._id}
                              className="p-4 text-gray-700 bg-gray-50 rounded-lg border-l-4 border-blue-300"
                            >
                              <p className="text-lg">
                                <strong>MCQ {idx + 1}:</strong> {q.question}
                              </p>
                              <ul className="list-disc pl-6 mt-2">
                                {q.options.map((opt, i) => (
                                  <li key={i} className={i === q.correctOption ? "text-green-600" : "text-gray-600"}>
                                    {opt} {i === q.correctOption ? "(সঠিক)" : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {/* CQs */}
                          {subjectQuestions.cqs.map((q, idx) => (
                            <div
                              key={q._id}
                              className="p-4 text-gray-700 bg-gray-50 rounded-lg border-l-4 border-blue-300"
                            >
                              <p className="text-lg">
                                <strong>CQ {idx + 1}:</strong> {q.passage.slice(0, 50)}...
                              </p>
                              <p className="mt-2 text-gray-600">
                                <strong>উত্তর:</strong> {q.answer || "প্রদান করা হয়নি"}
                              </p>
                            </div>
                          ))}
                          {/* SQs */}
                          {subjectQuestions.sqs.map((q, idx) => (
                            <div
                              key={q._id}
                              className="p-4 text-gray-700 bg-gray-50 rounded-lg border-l-4 border-blue-300"
                            >
                              <p className="text-lg">
                                <strong>SQ {idx + 1}:</strong> {q.question}
                              </p>
                              <p className="mt-2 text-gray-600">
                                <strong>উত্তর:</strong> {q.answer || "প্রদান করা হয়নি"}
                              </p>
                            </div>
                          ))}
                          {subjectQuestions.mcqs.length === 0 &&
                            subjectQuestions.cqs.length === 0 &&
                            subjectQuestions.sqs.length === 0 && (
                              <p className="text-gray-500 text-lg">এই বিষয়ের জন্য কোনো প্রশ্ন পাওয়া যায়নি।</p>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-600 text-xl col-span-full bg-white/80 backdrop-blur-md p-10 rounded-xl shadow-lg animate-fadeInUp">
                  কোনো ফলাফল পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <p className="text-gray-700 mb-6 text-xl font-medium">
              আজই শুরু করুন আপনার শিক্ষা—ফ্রি রিসোর্স পান!
            </p>
            <a
              href="/signUp"
              className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-full text-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              রেজিস্ট্রেশন করুন
            </a>
          </div>
        </div>
      </section>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}