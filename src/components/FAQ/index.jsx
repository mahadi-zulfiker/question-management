"use client";
import React, { useState } from "react";
import Image from "next/image";
import { HelpCircle, Clock, CreditCard, Phone, User } from "lucide-react";
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
      icon: <User className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "সংবাদ এবং টপিক?",
      answer: "আমাদের সাম্প্রতিক আপডেট এবং গুরুত্বপূর্ণ বিষয়বস্তু পড়ুন।",
      icon: <HelpCircle className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "কিভাবে ব্যবহার করবেন?",
      answer: "আমাদের প্ল্যাটফর্ম সহজ এবং ব্যবহারকারী-বান্ধব। কিভাবে শুরু করবেন তা জানুন।",
      icon: <Clock className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "আমাদের পরিষেবাগুলি কি?",
      answer: "আমরা ওয়েব ডেভেলপমেন্ট, ডিজাইন এবং অন্যান্য পরিষেবা প্রদান করি।",
      icon: <CreditCard className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "সাপোর্টের সাথে কিভাবে যোগাযোগ করবো?",
      answer: "আমাদের কন্টাক্ট ফর্ম বা ইমেলের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।",
      icon: <Phone className="text-blue-600 w-6 h-6" />,
    },
    {
      question: "আপনারা কোন পেমেন্ট পদ্ধতি গ্রহণ করেন?",
      answer: "আমরা ক্রেডিট কার্ড, পেপাল এবং অন্যান্য সাধারণ পেমেন্ট পদ্ধতি গ্রহণ করি।",
      icon: <CreditCard className="text-blue-600 w-6 h-6" />,
    },
  ];

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6 text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-700">
          প্রায়শই জিজ্ঞাসিত প্রশ্ন
        </h1>
        <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
          আমাদের প্ল্যাটফর্ম সম্পর্কিত সাধারণ প্রশ্নের উত্তর এখানে খুঁজুন।
        </p>
      </div>
      <div className="container mx-auto px-6 text-center mb-16">
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="আপনার প্রশ্ন লিখুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-6 pl-14 bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
          />
          <span className="absolute left-6 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="relative bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-xl shadow-md group overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              <button
                className="w-full flex justify-between items-center p-6 text-left text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => toggleFAQ(index)}
              >
                <div className="flex items-center">
                  {faq.icon}
                  <span className="ml-4 text-xl">{faq.question}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transform transition-transform duration-200 ${
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
              {openIndex === index && <div className="p-6 text-gray-600 bg-gray-50 text-lg">{faq.answer}</div>}
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <div className="relative group">
            <Image
              src={FAQImage}
              alt="FAQ Illustration"
              height={600}
              width={650}
              className="rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FAQ;