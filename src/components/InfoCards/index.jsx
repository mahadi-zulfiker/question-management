"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import courseImg from '../../../public/course.jpg';
import { ShoppingCart, Loader2 } from 'lucide-react';

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
        setQuestionBanks(data.slice(0, 4));
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
    router.push('/questionBank');
  };

  return (
    <div className="container mx-auto px-6 py-28">
      <h2 className="text-5xl font-extrabold text-gray-800 text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
        আমাদের প্রশ্নব্যাংক দেখুন
      </h2>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {questionBanks.map((qb, index) => (
              <div
                key={qb._id}
                className="relative rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100/50 group hover:shadow-2xl transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Image
                  className="w-full h-56 object-cover"
                  src={courseImg}
                  alt={qb.name}
                  width={400}
                  height={224}
                  priority
                />
                <div className="px-6 py-6">
                  <h3 className="font-bold text-2xl text-gray-900">{qb.name}</h3>
                  <p className="text-gray-600 text-base mt-3 line-clamp-2">{qb.description}</p>
                  <p className="text-gray-500 text-base mt-3">
                    {qb.class 
                      ? `${qb.class.level ? qb.class.level + ' - ' : ''}Class ${qb.class.classNumber} - ${qb.class.subject}`
                      : 'No class assigned'}
                  </p>
                  <p className="text-gray-500 text-base mt-2">প্রশ্ন সংখ্যা: {qb.questions.length}</p>
                  <p className="text-gray-500 text-base mt-2">
                    মেয়াদ: {new Date(qb.validity).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-gray-500 text-base mt-2">
                    তৈরি: {new Date(qb.createdAt).toLocaleDateString('bn-BD')}
                  </p>
                  <p className="text-gray-500 text-base mt-2">মূল্য: ৳ {qb.price}</p>
                  <p className="text-gray-500 text-base mt-2">স্ট্যাটাস: {qb.status}</p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-4 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
                    onClick={() => router.push(`/question-bank-checkout/${qb._id}`)}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    এখন কিনুন
                  </button>
                </div>
              </div>
            ))}
          </div>
          {questionBanks.length === 4 && (
            <div className="text-center mt-16">
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-5 px-10 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300"
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