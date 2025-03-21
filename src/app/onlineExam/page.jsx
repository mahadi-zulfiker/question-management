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
    isSubmitted: false
  });
  const [examData, setExamData] = useState({
    modelTests: [],
    classes: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/onlineExamSubmit");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log("Fetched Model Tests:", data.modelTests); // Debug fetched data
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

  // Timer logic
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
      toast.error("Please log in to start the exam!");
      return;
    }

    try {
      console.log("Form Data for Filtering:", {
        selectedClass: Number(formData.selectedClass),
        selectedDepartment: formData.selectedDepartment || "N/A",
        selectedSubject: formData.selectedSubject,
        selectedTestNumber: formData.selectedTestNumber
      });

      const filteredData = examData.modelTests.filter(entry => {
        const classMatch = entry.questionClass === Number(formData.selectedClass);
        const deptMatch = entry.department === (formData.selectedDepartment || "N/A");
        const subjectMatch = entry.subject === formData.selectedSubject;
        const testMatch = entry.testNumber === formData.selectedTestNumber;
        console.log(`Entry: ${entry.questionClass}, ${entry.department}, ${entry.subject}, ${entry.testNumber} -> Matches: ${classMatch}, ${deptMatch}, ${subjectMatch}, ${testMatch}`);
        return classMatch && deptMatch && subjectMatch && testMatch;
      });

      console.log("Filtered Data:", filteredData);

      if (filteredData.length > 0) {
        const questions = filteredData[0].questions;
        console.log("Questions Loaded:", questions); // Debug questions
        const examDuration = 1800; // 30 minutes

        const submitResponse = await fetch('/api/onlineExamSubmit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionClass: Number(formData.selectedClass), // Ensure number
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
          isSubmitted: false
        });
      } else {
        toast.error("No exams found for the selected options!");
      }
    } catch (error) {
      console.error("Error starting exam:", error);
      toast.error("Failed to start exam!");
    }
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: optionIndex
      }
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

      if (response.ok) {
        setExamState(prev => ({
          ...prev,
          isSubmitted: true,
          examStarted: false
        }));
        toast.success(auto ? "Exam auto-submitted!" : "Exam submitted successfully!");
      } else {
        throw new Error("Failed to submit exam");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed!");
    }
  };

  const handleAutoSubmit = () => handleSubmit(true);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Dynamic options
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
      <ToastContainer />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Online Examination Portal
          </h1>
          
          {status === "loading" || loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Exam Settings</h2>
                <form onSubmit={(e) => { e.preventDefault(); fetchQuestions(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                          className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Test Number</label>
                      <select
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      Start Exam
                    </button>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-700">Exam Questions</h2>
                  {examState.examStarted && !examState.isSubmitted && (
                    <div className="text-lg font-medium text-red-600">
                      Time Left: {formatTime(examState.timeLeft)}
                    </div>
                  )}
                </div>

                {examState.questions.length > 0 ? (
                  <div className="space-y-6">
                    {examState.questions.map((q, qIndex) => (
                      <div key={qIndex} className="border-b pb-4">
                        <p className="text-lg font-medium text-gray-800 mb-3">
                          {qIndex + 1}. {q.question} 
                          <span className="text-sm text-gray-500"> ({q.type})</span>
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={examState.answers[qIndex] === optIndex}
                                onChange={() => handleAnswerChange(qIndex, optIndex)}
                                disabled={examState.isSubmitted}
                                className="h-4 w-4 text-blue-600"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!examState.isSubmitted && (
                      <button
                        onClick={() => handleSubmit(false)}
                        className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Submit Exam
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Please select exam parameters to begin
                    </p>
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