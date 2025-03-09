"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import courseImg from '../../../public/course.jpg'; // Default image

const InfoCards = () => {
  const [questionBanks, setQuestionBanks] = useState([]);
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
        setQuestionBanks(data.slice(0, 4)); // Limit to first 4 question banks
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

  const handleSeeMore = () => {
    router.push('/questionBank'); // Redirect to full question bank page
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        আমাদের প্রশ্নব্যাংক দেখুন
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-indigo-700 text-2xl animate-pulse">লোড হচ্ছে...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {questionBanks.map((qb) => (
              <div
                key={qb._id}
                className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white transform hover:scale-105 transition-all duration-300"
              >
                <Image
                  className="w-full h-48 object-cover"
                  src={courseImg} // Use dynamic image if available in future
                  alt={qb.name}
                  width={400}
                  height={200}
                  priority
                />
                <div className="px-6 py-4">
                  <h3 className="font-bold text-lg text-gray-900">{qb.name}</h3>
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">{qb.description}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {qb.class 
                      ? `${qb.class.level ? qb.class.level + ' - ' : ''}Class ${qb.class.classNumber} - ${qb.class.subject}`
                      : 'No class assigned'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">প্রশ্ন সংখ্যা: {qb.questions.length}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    মেয়াদ: {new Date(qb.validity).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    তৈরি: {new Date(qb.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">মূল্য: ৳ {qb.price}</p>
                  <p className="text-gray-600 text-sm mt-1">স্ট্যাটাস: {qb.status}</p>
                </div>
                <div className="px-6 pb-4">
                  <button
                    className="w-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold py-2 px-4 rounded hover:from-blue-500 hover:to-purple-600 transition-all"
                    onClick={() => router.push(`/question-bank-checkout/${qb._id}`)}
                  >
                    এখন কিনুন
                  </button>
                </div>
              </div>
            ))}
          </div>
          {questionBanks.length === 4 && (
            <div className="text-center mt-8">
              <button
                className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-all shadow-md"
                onClick={handleSeeMore}
              >
                আরো দেখুন
              </button>
            </div>
          )}
        </>
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default InfoCards;