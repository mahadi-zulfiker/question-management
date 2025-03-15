"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Clock, HelpCircle, BookOpen, Play, Loader2, Search } from "lucide-react";

export default function ModelTests() {
  const [modelTests, setModelTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelTests();
  }, []);

  const fetchModelTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/modelTests");
      const data = await res.json();
      if (res.ok) {
        setModelTests(data);
      } else {
        toast.error("Failed to fetch model tests");
      }
    } catch (error) {
      console.error("Error fetching model tests:", error);
      toast.error("Error fetching model tests");
    } finally {
      setLoading(false);
    }
  };

  // Filter model tests based on search term
  const filteredModelTests = modelTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (test.class &&
      (test.class.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.class.chapterName && test.class.chapterName.toLowerCase().includes(searchTerm.toLowerCase()))))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <Head>
        <title>নমুনা মডেল টেস্ট</title>
        <meta name="description" content="প্রস্তুতি নিন আপনার পরীক্ষার জন্য নমুনা মডেল টেস্টের মাধ্যমে!" />
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
            নমুনা মডেল টেস্ট
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200 mt-6 drop-shadow-md">
            আপনার সাফল্যের জন্য সেরা প্রস্তুতি!
          </p>
          <div className="mt-10 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="নাম, বিষয়, অধ্যায় অনুসারে খুঁজুন..."
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

      {/* Tests List */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : (
            filteredModelTests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredModelTests.map((test, index) => (
                  <div
                    key={test._id}
                    className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Card Header with Gradient and Status */}
                    <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
                      <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-semibold truncate">{test.name}</h2>
                        <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                          Available
                        </span>
                      </div>
                      <p className="text-base opacity-80">{test.class?.subject || "সাধারণ"}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-5">
                      {test.class && (
                        <>
                          <div className="flex items-center space-x-4 text-gray-700">
                            <BookOpen className="text-blue-500 w-6 h-6" />
                            <p className="text-xl">
                              <span className="font-medium">ক্লাস:</span> {test.class.classNumber}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-700">
                            <BookOpen className="text-blue-500 w-6 h-6" />
                            <p className="text-xl">
                              <span className="font-medium">অধ্যায়:</span> {test.class.chapterNumber} - {test.class.chapterName}
                            </p>
                          </div>
                        </>
                      )}
                      <div className="flex items-center space-x-4 text-gray-700">
                        <Clock className="text-blue-500 w-6 h-6" />
                        <p className="text-xl">
                          <span className="font-medium">সময়কাল:</span> {test.duration} মিনিট
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-700">
                        <HelpCircle className="text-blue-500 w-6 h-6" />
                        <p className="text-xl">
                          <span className="font-medium">প্রশ্ন:</span> {test.questions.length}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                      <Link href={`/modelTests/${test._id}`}>
                        <button className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
                          <Play className="h-6 w-6" />
                          <span>টেস্ট শুরু করুন</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 text-xl bg-white/80 backdrop-blur-md p-10 rounded-xl shadow-lg animate-fadeInUp">
                কোনো ফলাফল পাওয়া যায়নি।
              </div>
            )
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <p className="text-gray-700 mb-6 text-xl font-medium">
              আজই শুরু করুন আপনার প্রস্তুতি—ফ্রি টেস্ট পান!
            </p>
            <Link href="/signUp">
              <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-4 rounded-full text-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
                রেজিস্ট্রেশন করুন
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
    </div>
  );
}