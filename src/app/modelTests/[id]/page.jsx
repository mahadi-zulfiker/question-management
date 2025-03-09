"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import banner from "../../../../public/questionBanner.jpg";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

export default function StartModelTest({ params }) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const testId = params?.id;

  useEffect(() => {
    if (!testId) {
      toast.error("❌ No test ID provided!");
      setLoading(false);
      return;
    }

    async function fetchTestData() {
      try {
        const response = await fetch(`/api/modelTests/${testId}`);
        const data = await response.json();
        if (response.ok) {
          setTestData(data);
          setTimeLeft(data.duration * 60);
        } else {
          toast.error(`❌ Failed to load test: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        toast.error("❌ Error fetching test!");
      } finally {
        setLoading(false);
      }
    }
    fetchTestData();
  }, [testId]); // Dependency on testId

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleAnswerChange = (questionId, type, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { type, answer }
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const response = await fetch("/api/modelTests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: testId, // Use resolved testId
          answers,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Model Test submitted successfully!");
      } else {
        toast.error(`❌ Failed to submit test: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("❌ Error submitting test!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">No test data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner Section */}
      <div className="relative w-full h-80 mb-8 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image src={banner} layout="fill" objectFit="cover" alt="Start Model Test Banner" className="opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-black bg-opacity-50 px-8 py-4 rounded-lg shadow-lg">
            {testData.name.toUpperCase()}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </p>
        </motion.div>
      </div>

      {/* Exam Section */}
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Take Your Model Test</h2>
          {!submitted ? (
            <>
              {testData.questions.mcqs.map((q, idx) => (
                <div key={q._id} className="mb-6 border-b pb-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((option, optIdx) => (
                      <label key={optIdx} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`mcq-${q._id}`}
                          value={optIdx}
                          checked={answers[q._id]?.answer === optIdx}
                          onChange={() => handleAnswerChange(q._id, 'mcq', optIdx)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                          disabled={submitted}
                        />
                        <span className="text-gray-700">
                          {String.fromCharCode(97 + optIdx)}. {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {testData.questions.cqs.map((q, idx) => (
                <div key={q._id} className="mb-6 border-b pb-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {testData.questions.mcqs.length + idx + 1}. {q.passage}
                  </p>
                  <textarea
                    value={answers[q._id]?.answer || ''}
                    onChange={(e) => handleAnswerChange(q._id, 'cq', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Write your answer here..."
                    disabled={submitted}
                  />
                </div>
              ))}
              {testData.questions.sqs.map((q, idx) => (
                <div key={q._id} className="mb-6 border-b pb-6">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {testData.questions.mcqs.length + testData.questions.cqs.length + idx + 1}. {q.question}
                  </p>
                  <textarea
                    value={answers[q._id]?.answer || ''}
                    onChange={(e) => handleAnswerChange(q._id, 'sq', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Write your answer here..."
                    disabled={submitted}
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300"
                >
                  Submit Test
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-green-600 mb-4">Test Submitted!</h3>
              <p className="text-gray-700">Your answers have been recorded.</p>
              <Link href="/modelTests">
                <button className="mt-4 bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300">
                  Back to Model Tests
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}