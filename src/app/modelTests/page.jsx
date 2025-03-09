"use client";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import img from "../../../public/questionBanner.jpg";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FaClock, FaQuestionCircle, FaBook, FaPlay } from 'react-icons/fa';

export default function ModelTests() {
  const [modelTests, setModelTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelTests();
  }, []);

  const fetchModelTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/modelTests');
      const data = await res.json();
      if (res.ok) {
        setModelTests(data);
      } else {
        toast.error('Failed to fetch model tests');
      }
    } catch (error) {
      console.error('Error fetching model tests:', error);
      toast.error('Error fetching model tests');
    } finally {
      setLoading(false);
    }
  };

  // Filter model tests based on search term (search in name, description, and class details)
  const filteredModelTests = modelTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (test.class && (
      test.class.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.class.chapterName && test.class.chapterName.toLowerCase().includes(searchTerm.toLowerCase()))
    ))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Head>
        <title>নমুনা মডেল টেস্ট</title>
        <meta name="description" content="প্রস্তুতি নিন আপনার পরীক্ষার জন্য নমুনা মডেল টেস্টের মাধ্যমে!" />
      </Head>

      {/* Banner with Header */}
      <div className="relative w-full h-80 mb-12 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image
          src={img}
          alt="Model Test Banner"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-70"
        />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center z-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white px-8 py-4">
            নমুনা মডেল টেস্ট
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2 drop-shadow-md">
            আপনার সাফল্যের জন্য সেরা প্রস্তুতি!
          </p>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto px-4 mb-10">
        <input
          type="text"
          placeholder="খুজুন... (Search by name, subject, or chapter)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg shadow-md transition-all duration-300 placeholder-gray-500"
        />
      </div>

      {/* Tests List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          filteredModelTests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModelTests.map((test, index) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                    <h2 className="text-xl font-semibold truncate">{test.name}</h2>
                    <p className="text-sm opacity-80">{test.class?.subject || 'General'}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    {test.class && (
                      <>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaBook className="text-indigo-500" />
                          <p>
                            <span className="font-medium">Class:</span> {test.class.classNumber}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700">
                          <FaBook className="text-indigo-500" />
                          <p>
                            <span className="font-medium">Chapter:</span> {test.class.chapterNumber} - {test.class.chapterName}
                          </p>
                        </div>
                      </>
                    )}
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
                    <Link href={`/modelTests/${test._id}`}>
                      <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300">
                        <FaPlay />
                        <span>Start Test</span>
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
              className="text-center text-gray-600 text-lg bg-white p-6 rounded-xl shadow-md col-span-full"
            >
              কোনো ফলাফল পাওয়া যায়নি। (No results found.)
            </motion.div>
          )
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">শুরু করুন আজই আপনার প্রস্তুতি—ফ্রি টেস্ট পান!</p>
          <Link href="/signUp">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              রেজিস্ট্রেশন করুন
            </button>
          </Link>
        </div>
      </div>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </div>
  );
}