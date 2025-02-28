"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState } from "react";
import banner from "../../../public/questionBanner.jpg";
import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { id: 0, name: "সব বিষয় (All Subjects)" },
  { id: 1, name: "HSC - বিজ্ঞান (HSC - Science)" },
  { id: 2, name: "HSC - সাধারণ (HSC - General)" },
  { id: 3, name: "HSC - ব্যবসায় শিক্ষা (HSC - Commerce)" },
  { id: 4, name: "HSC - মানবিক (HSC - Arts)" },
  { id: 5, name: "SSC - বিজ্ঞান (SSC - Science)" },
  { id: 6, name: "SSC - সাধারণ (SSC - General)" },
  { id: 7, name: "SSC - ব্যবসায় শিক্ষা (SSC - Commerce)" },
  { id: 8, name: "SSC - মানবিক (SSC - Arts)" },
];

const subjects = [
  {
    id: 1,
    name: "উচ্চতর গণিত ১ম পত্র (Higher Math 1st Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: [
      "সংযুক্ত ও যোগক কোণের ত্রিকোণমিতিক অনুপাত (Trigonometric Ratios of Sum and Difference of Angles)",
      "ফাংশন ও ফাংশনের লেখচিত্র (Function and Graphs)",
      "অন্তরীকরণ (Differentiation)",
      "যোগজীকরণ (Integration)",
      "সীমা ও সংবর্তন (Limits and Continuity)",
    ],
  },
  {
    id: 2,
    name: "উচ্চতর গণিত ২য় পত্র (Higher Math 2nd Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: [
      "ডিফারেনশিয়াল ইকুয়েশন (Differential Equation)",
      "ম্যাট্রিক্স (Matrix)",
      "সীমা (Limits)",
      "ভেক্টর (Vectors)",
      "রৈখিক প্রোগ্রামিং (Linear Programming)",
    ],
  },
  {
    id: 3,
    name: "পদার্থবিজ্ঞান ১ম পত্র (Physics 1st Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: [
      "ভেক্টর (Vector)",
      "নিউটনের গতি সূত্র (Newton’s Laws of Motion)",
      "আলোক তরঙ্গ (Wave Optics)",
      "তাপগতিবিদ্যা (Thermodynamics)",
      "বিদ্যুত ও চুম্বক (Electricity and Magnetism)",
    ],
  },
  {
    id: 4,
    name: "বাংলা (Bangla)",
    category: "HSC - সাধারণ",
    chapters: [
      "গদ্য (Prose)",
      "পদ্য (Poetry)",
      "ব্যাকরণ (Grammar)",
      "রচনা (Essay Writing)",
      "পরিবেশন (Presentation)",
    ],
  },
  {
    id: 5,
    name: "রসায়ন ১ম পত্র (Chemistry 1st Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: [
      "পরমাণুর গঠন (Atomic Structure)",
      "রাসায়নিক বন্ধন (Chemical Bonding)",
      "অক্সিডেশন-রিডাকশন বিক্রিয়া (Redox Reactions)",
      "গ্যাস ও তরল (Gases and Liquids)",
      "থার্মোকেমিস্ট্রি (Thermochemistry)",
    ],
  },
  {
    id: 6,
    name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা (Business Organization and Management)",
    category: "HSC - ব্যবসায় শিক্ষা",
    chapters: [
      "উদ্যোক্তা (Entrepreneurship)",
      "ব্যবসায়ের পরিকল্পনা (Business Planning)",
      "প্রতিষ্ঠানের গঠন (Organizational Structure)",
      "বাজার বিশ্লেষণ (Market Analysis)",
      "আর্থিক ব্যবস্থাপনা (Financial Management)",
    ],
  },
  {
    id: 7,
    name: "রাষ্ট্রবিজ্ঞান (Political Science)",
    category: "HSC - মানবিক",
    chapters: [
      "রাষ্ট্রের সংজ্ঞা (Definition of State)",
      "সংবিধান (Constitution)",
      "গণতন্ত্র (Democracy)",
      "আন্তর্জাতিক সম্পর্ক (International Relations)",
      "রাজনৈতিক ব্যবস্থা (Political Systems)",
    ],
  },
  {
    id: 8,
    name: "উচ্চতর গণিত (Higher Mathematics)",
    category: "SSC - বিজ্ঞান",
    chapters: [
      "সেট ও ফাংশন (Sets and Functions)",
      "বীজগণিতিক রাশি (Algebraic Expressions)",
      "জ্যামিতি (Geometry)",
      "সম্ভাবনা (Probability)",
      "সংখ্যা তত্ত্ব (Number Theory)",
    ],
  },
  {
    id: 9,
    name: "বাংলাদেশ ও বিশ্বপরিচয় (Bangladesh and World Studies)",
    category: "SSC - মানবিক",
    chapters: [
      "ভূগোল (Geography)",
      "ইতিহাস (History)",
      "রাজনীতি (Politics)",
      "অর্থনীতি (Economics)",
      "সংস্কৃতি (Culture)",
    ],
  },
];

export default function AdmissionSubjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব বিষয় (All Subjects)");
  const [subjectStates, setSubjectStates] = useState({}); // Track open/closed state per subject

  // Toggle individual subject
  const toggleSubject = (id) => {
    setSubjectStates((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the state for this specific subject
    }));
  };

  // Filter subjects based on search term and category (search in both Bengali and English)
  const filteredSubjects = subjects.filter(
    (subject) =>
      (selectedCategory === "সব বিষয় (All Subjects)" || subject.category === selectedCategory) &&
      (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.chapters.some((chapter) => chapter.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner Section */}
      <div className="relative w-full h-80 mb-8 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image src={banner} layout="fill" objectFit="cover" alt="Admission Subjects Banner" className="opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-black bg-opacity-50 px-8 py-4 rounded-lg shadow-lg">ভর্তি পরীক্ষার বিষয়সমূহ</h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2">আপনার ভর্তি পরীক্ষার জন্য সেরা প্রস্তুতি!</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="খুজুন... (Search...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none text-lg shadow-md transition-all duration-300 placeholder-gray-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSubjectStates({});
              setSearchTerm('');
            }}
            className="w-full md:w-1/3 p-4 rounded-lg border border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 outline-none text-lg shadow-md"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: subject.id * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className="p-4 flex justify-between items-center text-lg font-semibold text-gray-800 hover:bg-gray-100"
                  onClick={() => toggleSubject(subject.id)}
                >
                  <span>{subject.name}</span>
                  <span className="text-indigo-600 text-xl">{subjectStates[subject.id] ? "−" : "+"}</span>
                </div>
                {subjectStates[subject.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-gray-100 border-t border-gray-200"
                  >
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      {subject.chapters.map((chapter, index) => (
                        <li key={index} className="hover:text-indigo-600 transition-colors duration-200">
                          {chapter}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full text-lg">কোনো ফলাফল পাওয়া যায়নি। (No results found.)</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">শুরু করুন আজই আপনার ভর্তি পরীক্ষার প্রস্তুতি—ফ্রি রিসোর্স পান!</p>
          <Link href="/signUp">
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              রেজিস্ট্রেশন করুন
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}