"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

export default function StartExam() {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const params = useParams();
  const testId = params?.id;

  useEffect(() => {
    if (!testId) {
      toast.error("❌ No test ID provided!");
      setLoading(false);
      return;
    }

    async function fetchTestData() {
      try {
        const response = await fetch(`/api/admissionTest?id=${testId}`);
        const data = await response.json();
        if (response.ok) {
          setTestData(data);
          setTimeLeft(data.duration * 60); // Convert minutes to seconds
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
  }, [testId]);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleAnswerChange = (questionIndex, option) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const response = await fetch("/api/admissionTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          answers,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Exam submitted successfully!");
      } else {
        toast.error(`❌ Failed to submit exam: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("❌ Error submitting exam!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <p className="text-gray-600 text-xl">কোনো টেস্ট ডাটা পাওয়া যায়নি।</p>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <Head>
        <title>{testData.title} - ভর্তি পরীক্ষা</title>
        <meta name="description" content="আপনার ভর্তি পরীক্ষা দিন আত্মবিশ্বাসের সাথে!" />
      </Head>

      {/* Banner Section */}
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            {testData.title.toUpperCase()}
          </h1>
          <div className="mt-6 flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full">
                <circle
                  cx="50%"
                  cy="50%"
                  r="40%"
                  stroke="#60a5fa"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (timeLeft / (testData.duration * 60)) * 251.2}
                  className="transition-all duration-1000"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dy=".3em"
                  className="text-2xl font-bold text-white drop-shadow-md"
                >
                  {`${minutes}:${seconds.toString().padStart(2, "0")}`}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Section */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 sm:px-12 lg:px-16">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8 animate-fadeInUp">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">আপনার পরীক্ষা দিন</h2>
            {!submitted ? (
              <>
                {testData.questions.map((q, index) => (
                  <div key={index} className="mb-8 pb-6 border-b border-gray-200">
                    <p className="text-2xl font-medium text-gray-900 mb-4">
                      {index + 1}. {q.question || "প্রশ্ন প্রদান করা হয়নি"}
                    </p>
                    <div className="space-y-4">
                      {q.options && q.options.length > 0 ? (
                        q.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={answers[index] === option}
                              onChange={() => handleAnswerChange(index, option)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                              disabled={submitted}
                            />
                            <span className="text-lg">
                              {String.fromCharCode(97 + optIndex)}. {option}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-gray-600 text-lg">কোনো অপশন পাওয়া যায়নি</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
                  >
                    পরীক্ষা জমা দিন
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-10 bg-green-50 rounded-lg animate-fadeInUp">
                <h3 className="text-2xl font-semibold text-green-600 mb-4">পরীক্ষা জমা দেওয়া হয়েছে!</h3>
                <p className="text-gray-700 text-lg">আপনার উত্তরগুলো রেকর্ড করা হয়েছে।</p>
                <Link href="/admission">
                  <button className="mt-6 bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all duration-300">
                    টেস্টে ফিরে যান
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}