"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Search } from "lucide-react";

export default function QuestionBankShelf() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questionBanks");
      const data = await res.json();
      if (res.ok) {
        setQuestionBanks(data);
      } else {
        toast.error("Failed to fetch question banks");
      }
    } catch (error) {
      console.error("Error fetching question banks:", error);
      toast.error("Error fetching question banks");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestionBanks = questionBanks.filter((qb) => {
    const searchLower = search.toLowerCase();
    const nameMatch = qb.name.toLowerCase().includes(searchLower);
    const subjectMatch = qb.class?.subject?.toLowerCase().includes(searchLower) || "";
    const descriptionMatch = qb.description.toLowerCase().includes(searchLower);
    const filterMatch = filter === "" || qb.class?.subject === filter;
    return (nameMatch || subjectMatch || descriptionMatch) && filterMatch;
  });

  const subjects = [...new Set(questionBanks.map((qb) => qb.class?.subject).filter(Boolean))];

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
            প্রশ্নব্যাংক সংগ্রহ
          </h1>
          <div className="mt-10 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="বিষয় বা নাম অনুসারে খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-5 pl-14 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
            />
            <span className="absolute left-5 top-1/2 transform -translate-y-1/2">
              <Search className="w-6 h-6 text-gray-400" />
            </span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-6 p-4 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
          >
            <option value="">সব বিষয়</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Question Banks Section */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredQuestionBanks.map((qb) => (
                <div
                  key={qb._id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${filteredQuestionBanks.indexOf(qb) * 0.1}s` }}
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-indigo-900 mb-2">{qb.name}</h3>
                    <p className="text-gray-600 mb-2">
                      {qb.class
                        ? `${qb.class.level ? qb.class.level + " - " : ""}ক্লাস ${qb.class.classNumber} - ${qb.class.subject} - অধ্যায় ${qb.class.chapterNumber}`
                        : "কোনো ক্লাস বরাদ্দ করা হয়নি"}
                    </p>
                    <p className="text-gray-700 mb-3 line-clamp-2">{qb.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-indigo-700">৳{qb.price}</span>
                      <span className="text-sm text-gray-500">প্রশ্ন সংখ্যা: {qb.questions.length}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">মেয়াদ: {new Date(qb.validity).toLocaleDateString("bn-BD")}</span>
                      <span className="text-sm text-gray-500">তৈরি: {new Date(qb.createdAt).toLocaleDateString("bn-BD")}</span>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-all font-semibold shadow-md"
                      onClick={() => router.push(`/question-bank-checkout/${qb._id}`)}
                    >
                      কিনুন
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuestionBanks.length === 0 && (
                <p className="text-center col-span-full text-gray-600 text-xl py-10 bg-white/80 backdrop-blur-md rounded-xl shadow-lg animate-fadeInUp">
                  কোন প্রশ্নব্যাংক পাওয়া যায়নি।
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Footer />
    </div>
  );
}