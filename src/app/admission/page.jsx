"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import banner from "../../../public/questionBanner.jpg";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Importing icons from react-icons for visual enhancement
import { FaClock, FaQuestionCircle, FaBook, FaPlay } from "react-icons/fa";

export default function AdmissionTestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const response = await fetch("/api/admissionTest");
        const data = await response.json();
        if (response.ok) {
          setTests(data.tests || []);
        } else {
          toast.error(`❌ Failed to load tests: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        toast.error("❌ Error fetching tests!");
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {/* Banner Section */}
      <div className="relative w-full h-80 mb-12 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image src={banner} layout="fill" objectFit="cover" alt="Admission Tests Banner" className="opacity-70" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center z-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white px-8 py-4">
            Admission Tests
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2 drop-shadow-md">
            Explore and take your admission exams with confidence!
          </p>
        </motion.div>
      </div>

      {/* Tests List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                  <h2 className="text-xl font-semibold truncate">{test.title}</h2>
                  <p className="text-sm opacity-80">{test.type}</p>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FaBook className="text-indigo-500" />
                    <p>
                      <span className="font-medium">Class:</span> {test.classNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FaBook className="text-indigo-500" />
                    <p>
                      <span className="font-medium">Subject:</span> {test.subject}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FaBook className="text-indigo-500" />
                    <p>
                      <span className="font-medium">Chapter:</span> {test.chapterNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FaClock className="text-indigo-500" />
                    <p>
                      <span className="font-medium">Duration:</span> {test.duration} min
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <FaQuestionCircle className="text-indigo-500" />
                    <p>
                      <span className="font-medium">Questions:</span> {test.questions.length}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <Link href={`/startExam/${test._id}`}>
                    <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300">
                      <FaPlay />
                      <span>Start Exam</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-600 text-lg bg-white p-6 rounded-xl shadow-md"
          >
            No admission tests found.
          </motion.div>
        )}
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}