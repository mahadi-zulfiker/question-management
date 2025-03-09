'use client';

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import banner from '../../../public/questionBanner.jpg';
import { motion } from 'framer-motion'; // Ensure `framer-motion` is installed (`npm install framer-motion`)
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SubjectsList() {
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState({ mcqs: [], cqs: [], sqs: [] });
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectStates, setSubjectStates] = useState({}); // Track open/closed state per subject
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/createQuestionBank');
      const data = await res.json();
      if (res.ok) {
        setClasses(data.classes);
        setQuestions({ mcqs: data.mcqs, cqs: data.cqs, sqs: data.sqs });
        // Set default selections to the first available class and subject
        const classNumbers = [...new Set(data.classes.map(cls => cls.classNumber))].sort((a, b) => a - b);
        if (classNumbers.length > 0) {
          setSelectedClass(classNumbers[0].toString());
          const subjectsForClass = data.classes.filter(cls => cls.classNumber === classNumbers[0]);
          if (subjectsForClass.length > 0) {
            setSelectedSubject(subjectsForClass[0].subject);
          }
        }
      } else {
        toast.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
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
        toast.error('Failed to fetch filtered questions');
      }
    } catch (error) {
      console.error('Error fetching filtered questions:', error);
      toast.error('Error fetching filtered questions');
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
  const classNumbers = [...new Set(classes.map(cls => cls.classNumber))].sort((a, b) => a - b);
  const subjects = [...new Set(classes.filter(cls => cls.classNumber === parseInt(selectedClass)).map(cls => cls.subject))];

  // Filter subjects based on selected class and search term
  const filteredSubjects = classes
    .filter(cls => cls.classNumber === parseInt(selectedClass))
    .filter(cls =>
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.chapterName && cls.chapterName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  // Helper to get questions for a specific subject and class
  const getQuestionsForSubject = (subject) => {
    const classNum = parseInt(selectedClass);
    return {
      mcqs: questions.mcqs.filter(q => q.classNumber === classNum && q.subject === subject),
      cqs: questions.cqs.filter(q => q.classNumber === classNum && q.subject === subject),
      sqs: questions.sqs.filter(q => q.classLevel === classNum && q.subjectName === subject),
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner Section */}
      <div className="relative w-full h-72 mb-8 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image src={banner} layout="fill" objectFit="cover" alt="Academic Subjects Banner" className="opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-black bg-opacity-50 px-8 py-4 rounded-lg shadow-lg">একাডেমিক বিষয়সমূহ</h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2">আপনার শিক্ষার জন্য সর্বোত্তম গাইড!</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="খুজুন... (Search by subject or chapter)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg shadow-md transition-all duration-300 placeholder-gray-500"
          />
          <select
            className="w-full md:w-1/3 border rounded-lg px-4 py-3 bg-white shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              const firstSubject = classes.find(cls => cls.classNumber === parseInt(e.target.value))?.subject || '';
              setSelectedSubject(firstSubject);
              setSubjectStates({});
              setSearchTerm('');
            }}
          >
            <option value="">Select Class</option>
            {classNumbers.map((classNum) => (
              <option key={classNum} value={classNum}>
                Class {classNum}
              </option>
            ))}
          </select>
          <select
            className="w-full md:w-1/3 border rounded-lg px-4 py-3 bg-white shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSubjectStates({});
              setSearchTerm('');
            }}
          >
            <option value="">Select Subject</option>
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
            <p className="text-indigo-700 text-2xl animate-pulse">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((cls) => {
                const subjectQuestions = getQuestionsForSubject(cls.subject);
                return (
                  <motion.div
                    key={cls._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border rounded-xl p-5 bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                  >
                    <div
                      className="flex justify-between items-center text-lg font-semibold text-gray-800"
                      onClick={() => toggleSubject(cls._id)}
                    >
                      <span>{cls.subject} (Class {cls.classNumber})</span>
                      <span className="text-blue-600 text-xl">{subjectStates[cls._id] ? '−' : '+'}</span>
                    </div>
                    {subjectStates[cls._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-4"
                      >
                        {/* MCQs */}
                        {subjectQuestions.mcqs.map((q, idx) => (
                          <div key={q._id} className="pl-4 text-gray-700 text-base border-l-4 border-blue-300">
                            <p><strong>MCQ {idx + 1}:</strong> {q.question}</p>
                            <ul className="list-disc pl-5">
                              {q.options.map((opt, i) => (
                                <li key={i} className={i === q.correctOption ? 'text-green-600' : ''}>
                                  {opt} {i === q.correctOption ? '(Correct)' : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {/* CQs */}
                        {subjectQuestions.cqs.map((q, idx) => (
                          <div key={q._id} className="pl-4 text-gray-700 text-base border-l-4 border-blue-300">
                            <p><strong>CQ {idx + 1}:</strong> {q.passage.slice(0, 50)}...</p>
                            <p><strong>Answer:</strong> {q.answer || 'Not provided'}</p>
                          </div>
                        ))}
                        {/* SQs */}
                        {subjectQuestions.sqs.map((q, idx) => (
                          <div key={q._id} className="pl-4 text-gray-700 text-base border-l-4 border-blue-300">
                            <p><strong>SQ {idx + 1}:</strong> {q.question}</p>
                            <p><strong>Answer:</strong> {q.answer || 'Not provided'}</p>
                          </div>
                        ))}
                        {subjectQuestions.mcqs.length === 0 && subjectQuestions.cqs.length === 0 && subjectQuestions.sqs.length === 0 && (
                          <p className="text-gray-500">No questions available for this subject.</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 col-span-full text-lg">কোনো ফলাফল পাওয়া যায়নি। (No results found.)</p>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">শুরু করুন আজই আপনার শিক্ষা—ফ্রি রিসোর্স পান!</p>
          <Link href="/signUp">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              রেজিস্ট্রেশন করুন
            </button>
          </Link>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}