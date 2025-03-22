"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OnlineExam = () => {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    selectedClass: '',
    selectedDepartment: '',
    selectedSubject: '',
    selectedTestNumber: ''
  });
  const [examState, setExamState] = useState({
    questions: [],
    answers: {},
    timeLeft: 0,
    examStarted: false,
    submissionId: null,
    isSubmitted: false,
    score: null,
    totalQuestions: null
  });
  const [examData, setExamData] = useState({
    modelTests: [],
    classes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/onlineExamSubmit");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log("Fetched Model Tests:", data.modelTests);
        setExamData({
          modelTests: data.modelTests,
          classes: data.classes
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load exam data!");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let timer;
    if (examState.examStarted && examState.timeLeft > 0 && !examState.isSubmitted) {
      timer = setInterval(() => {
        setExamState(prev => {
          if (prev.timeLeft <= 1) {
            handleAutoSubmit();
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examState.examStarted, examState.timeLeft, examState.isSubmitted]);

  const fetchQuestions = async () => {
    if (status !== "authenticated") {
      toast.error("Please log in to start the exam!", { position: "top-center" });
      return;
    }

    try {
      const filteredData = examData.modelTests.filter(entry => 
        entry.questionClass === Number(formData.selectedClass) &&
        entry.department === (formData.selectedDepartment || "N/A") &&
        entry.subject === formData.selectedSubject &&
        entry.testNumber === formData.selectedTestNumber
      );

      if (filteredData.length > 0) {
        const questions = filteredData[0].questions;
        const examDuration = 1800; // 30 minutes

        const submitResponse = await fetch('/api/onlineExamSubmit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionClass: Number(formData.selectedClass),
            department: formData.selectedDepartment || "N/A",
            subject: formData.selectedSubject,
            testNumber: formData.selectedTestNumber,
            answers: {},
            userEmail: session.user.email,
            duration: examDuration
          })
        });

        if (!submitResponse.ok) throw new Error("Failed to start exam");
        const submitData = await submitResponse.json();

        setExamState({
          questions,
          answers: {},
          timeLeft: examDuration,
          examStarted: true,
          submissionId: submitData.submissionId,
          isSubmitted: false,
          score: null,
          totalQuestions: questions.length
        });
      } else {
        toast.error("No exams found for the selected options!", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam!", { position: "top-center" });
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setExamState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionIndex]: optionIndex }
    }));
  };

  const handleSubmit = async (auto = false) => {
    try {
      const response = await fetch('/api/onlineExamSubmit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: examState.submissionId,
          answers: examState.answers,
          autoSubmit: auto
        })
      });

      if (!response.ok) throw new Error("Failed to submit exam");
      const data = await response.json();

      setExamState(prev => ({
        ...prev,
        isSubmitted: true,
        examStarted: false,
        score: data.score,
        totalQuestions: data.totalQuestions
      }));
      toast.success(`${auto ? "Exam auto-submitted!" : "Exam submitted successfully!"} Score: ${data.score}/${data.totalQuestions}`, { position: "top-center" });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed!", { position: "top-center" });
    }
  };

  const handleAutoSubmit = () => handleSubmit(true);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const uniqueClasses = [...new Set(examData.modelTests.map(item => item.questionClass))].sort((a, b) => a - b);
  const departmentsForClass = formData.selectedClass
    ? [...new Set(examData.modelTests
        .filter(item => item.questionClass === Number(formData.selectedClass))
        .map(item => item.department))]
    : [];
  const subjectsForClass = formData.selectedClass
    ? [...new Set(examData.modelTests
        .filter(item => item.questionClass === Number(formData.selectedClass) &&
          (!formData.selectedDepartment || item.department === formData.selectedDepartment))
        .map(item => item.subject))]
    : [];
  const testNumbersForSelection = formData.selectedClass && formData.selectedSubject
    ? [...new Set(examData.modelTests
        .filter(item => item.questionClass === Number(formData.selectedClass) &&
          item.subject === formData.selectedSubject &&
          (!formData.selectedDepartment || item.department === formData.selectedDepartment))
        .map(item => item.testNumber))]
    : [];

  return (
    <>
      <Navbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-10 tracking-tight">
            Online Exam Portal
          </h1>

          {status === "loading" || loading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exam Settings Panel */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Exam Settings</h2>
                <form onSubmit={(e) => { e.preventDefault(); fetchQuestions(); }} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Class</label>
                    <select
                      className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      value={formData.selectedClass}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedClass: e.target.value, selectedDepartment: '', selectedSubject: '', selectedTestNumber: '' }))}
                    >
                      <option value="">Select Class</option>
                      {uniqueClasses.map(cls => (
                        <option key={cls} value={cls}>{`Class ${cls}`}</option>
                      ))}
                    </select>
                  </div>

                  {departmentsForClass.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Department</label>
                      <select
                        className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        value={formData.selectedDepartment}
                        onChange={(e) => setFormData(prev => ({ ...prev, selectedDepartment: e.target.value, selectedSubject: '', selectedTestNumber: '' }))}
                      >
                        <option value="">Select Department</option>
                        {departmentsForClass.map(dep => (
                          <option key={dep} value={dep}>{dep === "N/A" ? "General" : dep}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Subject</label>
                    <select
                      className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      value={formData.selectedSubject}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedSubject: e.target.value, selectedTestNumber: '' }))}
                      disabled={!formData.selectedClass}
                    >
                      <option value="">Select Subject</option>
                      {subjectsForClass.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Test Number</label>
                    <select
                      className="w-full p-3 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                      value={formData.selectedTestNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, selectedTestNumber: e.target.value }))}
                      disabled={!formData.selectedSubject}
                    >
                      <option value="">Select Test</option>
                      {testNumbersForSelection.map(num => (
                        <option key={num} value={num}>{`Model Test ${num}`}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={examState.examStarted || status !== "authenticated" || !formData.selectedTestNumber}
                    className="w-full py-3 sm:py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                  >
                    Start Exam
                  </button>
                </form>
              </div>

              {/* Exam Questions Panel */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-0">Exam Questions</h2>
                  {examState.examStarted && !examState.isSubmitted && (
                    <div className="text-lg sm:text-xl font-medium text-red-600 bg-red-100 px-3 py-1 rounded-lg">
                      Time Left: {formatTime(examState.timeLeft)}
                    </div>
                  )}
                </div>

                {examState.questions.length > 0 ? (
                  <div className="space-y-6">
                    {examState.questions.map((q, qIndex) => (
                      <div key={qIndex} className="border-b border-gray-200 pb-4">
                        {/* MCQ Display like ViewQuestionsAdmin */}
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {q.type ? q.type.toUpperCase() : "MCQ"}
                          </span>
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                          {qIndex + 1}. {q.question || "No question provided"}
                        </p>
                        {(q.options || []).length === 4 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-gray-700">
                            {(q.options || []).map((opt, optIndex) => (
                              <label
                                key={optIndex}
                                className={`flex items-center space-x-2 p-2 rounded-lg ${
                                  examState.isSubmitted && optIndex === q.correctAnswer
                                    ? 'bg-green-100 font-bold'
                                    : examState.isSubmitted && examState.answers[qIndex] === optIndex && optIndex !== q.correctAnswer
                                    ? 'bg-red-100'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${qIndex}`}
                                  checked={examState.answers[qIndex] === optIndex}
                                  onChange={() => handleAnswerChange(qIndex, optIndex)}
                                  disabled={examState.isSubmitted}
                                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm sm:text-base">
                                  {String.fromCharCode(2453 + optIndex)}. {opt || "N/A"}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div>
                            <div className="mb-3 text-gray-700">
                              {(q.options || []).slice(0, 3).map((opt, optIndex) => (
                                <p key={optIndex} className="text-sm sm:text-base">
                                  {String.fromCharCode(2453 + optIndex)}. {opt || "N/A"}
                                </p>
                              ))}
                            </div>
                            <p className="font-bold mb-2 text-sm sm:text-base">নিচের কোনটি সঠিক?</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-gray-700">
                              {(q.options || []).slice(3).map((opt, optIndex) => (
                                <label
                                  key={optIndex + 3}
                                  className={`flex items-center space-x-2 p-2 rounded-lg ${
                                    examState.isSubmitted && (optIndex + 3) === q.correctAnswer
                                      ? 'bg-green-100 font-bold'
                                      : examState.isSubmitted && examState.answers[qIndex] === (optIndex + 3) && (optIndex + 3) !== q.correctAnswer
                                      ? 'bg-red-100'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={examState.answers[qIndex] === (optIndex + 3)}
                                    onChange={() => handleAnswerChange(qIndex, optIndex + 3)}
                                    disabled={examState.isSubmitted}
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm sm:text-base">
                                    {String.fromCharCode(2453 + optIndex)}. {opt || "N/A"}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          Class: {formData.selectedClass || "N/A"} | Subject: {formData.selectedSubject || "N/A"} | Test: {formData.selectedTestNumber || "N/A"}
                        </p>
                      </div>
                    ))}
                    {!examState.isSubmitted ? (
                      <button
                        onClick={() => handleSubmit(false)}
                        className="w-full py-3 sm:py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 text-sm sm:text-base"
                      >
                        Submit Exam
                      </button>
                    ) : (
                      <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl text-center">
                        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Exam Results</h3>
                        <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mb-3">
                          {examState.score} / {examState.totalQuestions}
                        </p>
                        <p className="text-gray-600 text-sm sm:text-base mb-4">
                          {examState.score === examState.totalQuestions
                            ? "Perfect score! Amazing job!"
                            : examState.score > examState.totalQuestions / 2
                            ? "Great effort! Keep it up!"
                            : "Good try! Review and try again!"}
                        </p>
                        <button
                          onClick={() => setExamState(prev => ({ ...prev, examStarted: false, questions: [], isSubmitted: false, score: null, totalQuestions: null }))}
                          className="py-2 sm:py-3 px-4 sm:px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base"
                        >
                          Take Another Exam
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <p className="text-base sm:text-lg text-gray-500">Please select exam parameters to begin</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OnlineExam;