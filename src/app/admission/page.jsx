"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useState } from "react";
import banner from "../../../public/questionBanner.jpg";

const categories = [
  { id: 0, name: "সব বিষয়" },
  { id: 1, name: "HSC - বিজ্ঞান" },
  { id: 2, name: "HSC - সাধারণ" },
  { id: 3, name: "HSC - ব্যবসায় শিক্ষা" },
  { id: 4, name: "HSC - মানবিক" },
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
    ],
  },
  {
    id: 2,
    name: "উচ্চতর গণিত ২য় পত্র (Higher Math 2nd Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: ["ডিফারেনশিয়াল ইকুয়েশন (Differential Equation)", "ম্যাট্রিক্স (Matrix)", "সীমা (Limits)"]
  },
  {
    id: 3,
    name: "পদার্থবিজ্ঞান ১ম পত্র (Physics 1st Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: ["ভেক্টর (Vector)", "নিউটনের গতি সূত্র (Newton’s Laws of Motion)", "আলোক তরঙ্গ (Wave Optics)"]
  },
  {
    id: 4,
    name: "বাংলা (Bangla)",
    category: "HSC - সাধারণ",
    chapters: ["গদ্য (Prose)", "পদ্য (Poetry)", "ব্যাকরণ (Grammar)"]
  },
  {
    id: 5,
    name: "রসায়ন ১ম পত্র (Chemistry 1st Paper)",
    category: "HSC - বিজ্ঞান",
    chapters: ["পরমাণুর গঠন (Atomic Structure)", "রাসায়নিক বন্ধন (Chemical Bonding)", "অক্সিডেশন-রিডাকশন বিক্রিয়া (Redox Reactions)"]
  },
  {
    id: 6,
    name: "ব্যবসায় সংগঠন ও ব্যবস্থাপনা (Business Organization and Management)",
    category: "HSC - ব্যবসায় শিক্ষা",
    chapters: ["উদ্যোক্তা (Entrepreneurship)", "ব্যবসায়ের পরিকল্পনা (Business Planning)", "প্রতিষ্ঠানের গঠন (Organizational Structure)"]
  },
];

export default function AdmissionSubjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব বিষয়");
  const [expandedSubject, setExpandedSubject] = useState(null);

  const handleExpand = (id) => {
    setExpandedSubject(expandedSubject === id ? null : id);
  };

  const filteredSubjects = subjects.filter(
    (subject) =>
      (selectedCategory === "সব বিষয়" || subject.category === selectedCategory) &&
      subject.name.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative w-full h-96">
        <Image src={banner} alt="Admission Test Banner" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">ভর্তি পরীক্ষার বিষয়সমূহ</h1>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="অনুসন্ধান করুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleExpand(subject.id)}
              >
                <h2 className="text-lg font-semibold text-gray-800">{subject.name}</h2>
                <span className="text-xl">{expandedSubject === subject.id ? "▲" : "▼"}</span>
              </div>
              {expandedSubject === subject.id && (
                <div className="p-4 bg-gray-100 border-t border-gray-200">
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {subject.chapters.map((chapter, index) => (
                      <li key={index} className="hover:text-indigo-600">{chapter}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}