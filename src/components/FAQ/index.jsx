"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaQuestionCircle, FaRegClock, FaRegCreditCard, FaPhoneAlt, FaUser } from "react-icons/fa";
import FAQImage from "../../../public/FAQ.jpg";

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "আমাদের প্রোফাইল সম্পর্কে?",
      answer: "আমাদের ওয়েবসাইট সম্পর্কে আরও জানুন এবং কীভাবে আমরা আপনাকে সাহায্য করতে পারি।",
      icon: <FaUser className="text-indigo-600 w-6 h-6" />,
    },
    {
      question: "সংবাদ এবং টপিক?",
      answer: "আমাদের সাম্প্রতিক আপডেট এবং গুরুত্বপূর্ণ বিষয়বস্তু পড়ুন।",
      icon: <FaQuestionCircle className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "কিভাবে ব্যবহার করবেন?",
      answer: "আমাদের প্ল্যাটফর্ম সহজ এবং ব্যবহারকারী-বান্ধব। কিভাবে শুরু করবেন তা জানুন।",
      icon: <FaRegClock className="text-green-600 w-6 h-6" />,
    },
    {
      question: "আমাদের পরিষেবাগুলি কি?",
      answer: "আমরা ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং অন্যান্য পরিষেবা প্রদান করি।",
      icon: <FaRegCreditCard className="text-yellow-500 w-6 h-6" />,
    },
    {
      question: "সাপোর্টের সাথে কিভাবে যোগাযোগ করবো?",
      answer: "আমাদের কন্টাক্ট ফর্ম বা ইমেলের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।",
      icon: <FaPhoneAlt className="text-red-600 w-6 h-6" />,
    },
    {
      question: "আপনারা কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?",
      answer: "আমরা ক্রেডিট কার্ড, পেপাল এবং অন্যান্য সাধারণ পেমেন্ট পদ্ধতি গ্রহণ করি।",
      icon: <FaRegCreditCard className="text-blue-500 w-6 h-6" />,
    },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col justify-between py-12">
      <div className="container mx-auto px-6 text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">প্রায়শই জিজ্ঞাসিত প্রশ্ন</h1>
        <p className="text-lg text-gray-600">আমাদের প্ল্যাটফর্ম সম্পর্কিত সাধারণ প্রশ্নের উত্তর এখানে খুঁজুন।</p>
      </div>
      <div className="container mx-auto px-6 text-center mb-8">
        <input
          type="text"
          placeholder="আপনার প্রশ্ন লিখুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg p-4 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
      </div>
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-5 text-left text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center">
                  {faq.icon}
                  <span className="ml-3">{faq.question}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && <div className="p-5 text-gray-600 bg-gray-50">{faq.answer}</div>}
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={FAQImage}
            alt="FAQ Illustration"
            height={500}
            width={550}
            className="rounded-lg shadow-lg"
            priority
          />
        </div>
      </div>
    </div>
  );
}

export default FAQ;
