"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import banner from '../../../public/questionBanner.jpg';
import courseImg from '../../../public/course.jpg';

export default function QuestionBankShelf() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questionBanks');
      const data = await res.json();
      if (res.ok) {
        setQuestionBanks(data);
      } else {
        toast.error('Failed to fetch question banks');
      }
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast.error('Error fetching question banks');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestionBanks = questionBanks.filter((qb) => {
    const searchLower = search.toLowerCase();
    const nameMatch = qb.name.toLowerCase().includes(searchLower);
    const subjectMatch = qb.class?.subject?.toLowerCase().includes(searchLower) || '';
    const descriptionMatch = qb.description.toLowerCase().includes(searchLower);
    const filterMatch = filter === '' || qb.class?.subject === filter;
    return (nameMatch || subjectMatch || descriptionMatch) && filterMatch;
  });

  const subjects = [...new Set(questionBanks.map(qb => qb.class?.subject).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Banner */}
      <div className="relative w-full h-72 mb-10">
        <Image
          src={banner}
          alt="Question Bank Banner"
          layout="fill"
          objectFit="cover"
          className="rounded-b-3xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
            প্রশ্নব্যাংক সংগ্রহ
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
    
        {/* Question Banks Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-indigo-700 text-2xl animate-pulse">লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuestionBanks.map((qb) => (
              <div
                key={qb._id}
                className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={courseImg}
                    alt={qb.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-indigo-900 mb-2">
                    {qb.name}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {qb.class 
                      ? `${qb.class.level ? qb.class.level + ' - ' : ''}Class ${qb.class.classNumber} - ${qb.class.subject} - Ch. ${qb.class.chapterNumber}`
                      : 'No class assigned'}
                  </p>
                  <p className="text-gray-700 mb-3 line-clamp-2">{qb.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-indigo-700">৳ {qb.price}</span>
                    <span className="text-sm text-gray-500">
                      প্রশ্ন সংখ্যা: {qb.questions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      মেয়াদ: {new Date(qb.validity).toLocaleDateString('bn-BD')}
                    </span>
                    <span className="text-sm text-gray-500">
                      তৈরি: {new Date(qb.createdAt).toLocaleDateString('bn-BD')}
                    </span>
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
              <p className="text-center col-span-full text-gray-600 text-lg py-8">
                কোন প্রশ্নব্যাংক পাওয়া যায়নি।
              </p>
            )}
          </div>
        )}
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Footer />
    </div>
  );
}