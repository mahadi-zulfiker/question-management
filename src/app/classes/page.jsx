'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import banner from '../../../public/questionBanner.jpg';
import { motion } from 'framer-motion'; // Optional: Install `framer-motion` for animations
import Link from 'next/link';

const subjectsData = {
  'Class 4': {
    General: [
      { id: 1, name: 'বাংলা', englishName: 'Bangla', chapters: ['ব্যাকরণ', 'রচনা', 'শব্দার্থ', 'পাঠ্যক্রম', 'ভাষাতত্ত্ব'] },
      { id: 2, name: 'গণিত', englishName: 'Mathematics', chapters: ['সংখ্যা', 'যোগ-বিয়োগ', 'ভাগ-গুণ', 'জ্যামিতি'] },
    ],
  },
  'Class 5': {
    General: [
      { id: 3, name: 'গণিত', englishName: 'Mathematics', chapters: ['যোগ', 'বিয়োগ', 'গুণ', 'ভাগ', 'ভগ্নাংশ', 'দশমিক'] },
      { id: 4, name: 'বিজ্ঞান', englishName: 'Science', chapters: ['প্রকৃতি', 'পানি', 'বাতাস', 'জীবজগৎ'] },
    ],
  },
  'Class 6': {
    General: [
      { id: 5, name: 'বিজ্ঞান', englishName: 'Science', chapters: ['দেহতত্ত্ব', 'জীবজগৎ', 'পদার্থ', 'শক্তি', 'পরিবেশ'] },
      { id: 6, name: 'ইতিহাস', englishName: 'History', chapters: ['প্রাচীন ভারত', 'বাংলার ইতিহাস', 'মধ্যযুগ'] },
    ],
  },
  'Class 7': {
    General: [
      { id: 7, name: 'ইংরেজি', englishName: 'English', chapters: ['ব্যাকরণ', 'লেখনী', 'পাঠ্য', 'বাক্য গঠন', 'প্রবন্ধ'] },
      { id: 8, name: 'ভূগোল', englishName: 'Geography', chapters: ['ভূমি', 'জলবায়ু', 'প্রাকৃতিক সম্পদ', 'বাংলাদেশের ভূগোল'] },
    ],
  },
  'Class 8': {
    General: [
      { id: 9, name: 'ইতিহাস', englishName: 'History', chapters: ['প্রাচীন যুগ', 'মধ্যযুগ', 'আধুনিক যুগ', 'স্বাধীনতা সংগ্রাম'] },
      { id: 10, name: 'নাগরিকতা', englishName: 'Civics', chapters: ['রাষ্ট্র', 'গণতন্ত্র', 'নাগরিকের দায়িত্ব'] },
    ],
  },
  SSC: {
    Science: [
      { id: 11, name: 'উচ্চতর গণিত', englishName: 'Higher Mathematics', chapters: ['সেট ও ফাংশন', 'বীজগণিতিক রাশি', 'জ্যামিতি', 'সম্ভাবনা', 'সংখ্যা তত্ত্ব'] },
      { id: 12, name: 'পদার্থ বিজ্ঞান', englishName: 'Physics', chapters: ['গতিবিদ্যা', 'তাপগতিবিদ্যা', 'বিদ্যুৎ ও চুম্বক', 'আলোকবিজ্ঞান'] },
      { id: 13, name: 'রসায়ন বিজ্ঞান', englishName: 'Chemistry', chapters: ['পরমাণুর গঠন', 'রাসায়নিক বন্ধন', 'অক্সিডেশন-রিডাকশন', 'গ্যাস'] },
    ],
    Commerce: [
      { id: 14, name: 'হিসাব বিজ্ঞান', englishName: 'Accounting', chapters: ['হিসাবের ধারণা', 'জার্নাল', 'লেজার', 'আর্থিক বিবরণী', 'ব্যালেন্স শীট'] },
      { id: 15, name: 'ব্যবসায় সংগঠন', englishName: 'Business Organization', chapters: ['ব্যবসার সংজ্ঞা', 'উদ্যোক্তা', 'প্রশাসন', 'বাজার বিশ্লেষণ'] },
    ],
    Arts: [
      { id: 16, name: 'বাংলাদেশ ও বিশ্বপরিচয়', englishName: 'Bangladesh & World Studies', chapters: ['ভূগোল', 'ইতিহাস', 'রাজনীতি', 'অর্থনীতি'] },
      { id: 17, name: 'অর্থনীতি', englishName: 'Economics', chapters: ['অর্থনীতির মৌলিক ধারণা', 'বাজার ব্যবস্থা', 'টাকা ও ব্যাংকিং', 'ব্যবসায়িক অর্থনীতি'] },
    ],
  },
  HSC: {
    Science: [
      { id: 18, name: 'উচ্চতর গণিত', englishName: 'Higher Mathematics', chapters: ['ডিফারেনশিয়াল ক্যালকুলাস', 'ইন্টিগ্রাল ক্যালকুলাস', 'কমপ্লেক্স নাম্বার', 'ভেক্টর'] },
      { id: 19, name: 'পদার্থ বিজ্ঞান', englishName: 'Physics', chapters: ['তরঙ্গ', 'পরমাণু ও নিউক্লিয়ার পদার্থবিজ্ঞান', 'অপটিক্স', 'যান্ত্রিক শক্তি'] },
      { id: 20, name: 'রসায়ন বিজ্ঞান', englishName: 'Chemistry', chapters: ['অজৈব রসায়ন', 'জৈব রসায়ন', 'থার্মোকেমিস্ট্রি', 'ব্যালেন্স রাসায়ন'] },
    ],
    Commerce: [
      { id: 21, name: 'ব্যবস্থাপনা', englishName: 'Management', chapters: ['সংগঠনের ভিত্তি', 'মানব সম্পদ ব্যবস্থাপনা', 'বাজার বিশ্লেষণ', 'আর্থিক পরিচালনা'] },
      { id: 22, name: 'অর্থনীতি', englishName: 'Economics', chapters: ['মুদ্রা ও ব্যাংকিং', 'আন্তর্জাতিক অর্থনীতি', 'উত্পাদন ও ব্যয়', 'বাজার সম্পর্ক'] },
    ],
    Arts: [
      { id: 23, name: 'রাষ্ট্রবিজ্ঞান', englishName: 'Political Science', chapters: ['রাষ্ট্রের সংজ্ঞা', 'সংবিধান', 'গণতন্ত্র', 'আন্তর্জাতিক সম্পর্ক'] },
      { id: 24, name: 'সামাজিক বিজ্ঞান', englishName: 'Social Science', chapters: ['সমাজবিজ্ঞান', 'মানব সমাজের বিবর্তন', 'সংস্কৃতি', 'শিক্ষা'] },
    ],
  },
};

export default function SubjectsList() {
  const [selectedClass, setSelectedClass] = useState('SSC');
  const [selectedGroup, setSelectedGroup] = useState('Science');
  const [subjectStates, setSubjectStates] = useState({}); // Track open/closed state per subject
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle individual subject
  const toggleSubject = (id) => {
    setSubjectStates((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the state for this specific subject
    }));
  };

  // Filter subjects based on search term (search in both Bengali and English)
  const isSSCOrHSC = ['SSC', 'HSC'].includes(selectedClass);
  const baseSubjects = isSSCOrHSC ? subjectsData[selectedClass][selectedGroup] : subjectsData[selectedClass]?.General;
  const subjects = baseSubjects?.filter((subject) =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Banner Section */}
      <div className="relative w-full h-72 mb-8 flex items-center justify-center bg-gray-900 overflow-hidden">
        <Image src={banner} layout="fill" objectFit="cover" alt="Academic Subjects Banner" className="opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute text-white text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-black bg-opacity-50 px-8 py-4 rounded-lg shadow-lg">একাডেমিক বিষয়সমূহ</h1>
          <p className="text-lg md:text-xl text-gray-200 mt-2">আপনার শিক্ষার জন্য সর্বোত্তম গাইড!</p>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="খুজুন... (Search...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg shadow-md transition-all duration-300 placeholder-gray-500"
          />
          <select
            className="w-full md:w-1/3 border rounded-lg px-4 py-3 bg-white shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedGroup(Object.keys(subjectsData[e.target.value])[0] || 'General');
              setSubjectStates({});
              setSearchTerm('');
            }}
          >
            {Object.keys(subjectsData).map((classLevel) => (
              <option key={classLevel} value={classLevel}>
                {classLevel}
              </option>
            ))}
          </select>

          {isSSCOrHSC && (
            <select
              className="w-full md:w-1/3 border rounded-lg px-4 py-3 bg-white shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg"
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSubjectStates({});
                setSearchTerm('');
              }}
            >
              {Object.keys(subjectsData[selectedClass]).map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Subjects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects?.length > 0 ? (
            subjects.map((subject) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: subject.id * 0.1 }}
                className="border rounded-xl p-5 bg-white shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className="flex justify-between items-center text-lg font-semibold text-gray-800"
                  onClick={() => toggleSubject(subject.id)}
                >
                  <span>{subject.name} ({subject.englishName})</span>
                  <span className="text-blue-600 text-xl">{subjectStates[subject.id] ? '−' : '+'}</span>
                </div>
                {subjectStates[subject.id] && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-2"
                  >
                    {subject.chapters.map((chapter, index) => (
                      <li key={index} className="pl-4 text-gray-700 text-base border-l-4 border-blue-300">
                        {chapter}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full text-lg">কোনো ফলাফল পাওয়া যায়নি। (No results found.)</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">শুরু করুন আজই আপনার শিক্ষা—ফ্রি রিসোর্স পান!</p>
          <Link href="/signUp">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              রেজিস্ট্রেশন করুন
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}