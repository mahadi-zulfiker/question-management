"use client";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import img from "../../../public/questionBanner.jpg"

export default function ModelTests() {
  const testCategories = [
    { id: 1, name: 'কৃষি', englishName: 'Agri Admission', bgColor: 'from-blue-500 to-blue-700' },
    { id: 2, name: 'SUST', englishName: 'SUST Admission', bgColor: 'from-indigo-500 to-indigo-700' },
    { id: 3, name: 'সাপ্তাহিক ফ্রি মডেল টেস্ট', englishName: 'Free Weekly Model Test', bgColor: 'from-purple-500 to-purple-700' },
    { id: 4, name: 'ইঞ্জিনিয়ারিং', englishName: 'Engineering Admission', bgColor: 'from-teal-500 to-teal-700' },
    { id: 5, name: 'SSC একাডেমিক', englishName: 'SSC Academic', bgColor: 'from-green-500 to-green-700' },
    { id: 6, name: 'ভার্সিটি', englishName: 'Varsity Admission', bgColor: 'from-red-500 to-red-700' },
    { id: 7, name: 'মেডিকেল', englishName: 'Medical Admission', bgColor: 'from-pink-500 to-pink-700' },
    { id: 8, name: 'ঢাবি', englishName: 'DU Admission', bgColor: 'from-yellow-500 to-yellow-700' },
    { id: 9, name: 'GST', englishName: 'GST Admission', bgColor: 'from-orange-500 to-orange-700' },
    { id: 10, name: 'HSC একাডেমিক', englishName: 'HSC Academic', bgColor: 'from-cyan-500 to-cyan-700' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  // Filter categories based on search term (search in both Bengali and English)
  const filteredCategories = testCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.englishName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <Head>
        <title>নমুনা মডেল টেস্ট - Daricomma</title>
        <meta name="description" content="প্রস্তুতি নিন আপনার পরীক্ষার জন্য নমুনা মডেল টেস্টের মাধ্যমে!" />
      </Head>

      {/* Banner with Header */}
      <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
        <Image
          src={img}
          alt="Model Test Banner"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-extrabold drop-shadow-lg">নমুনা মডেল টেস্ট</h1>
            <p className="text-xl text-gray-200 mt-2">আপনার সাফল্যের জন্য সেরা প্রস্তুতি!</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto mb-10">
          <input
            type="text"
            placeholder="খুজুন... (Search...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-lg shadow-md transition-all duration-300 placeholder-gray-500"
          />
        </div>

        {/* Test Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Link href={`/tests/${category.id}`} key={category.id}>
                <div
                  className={`relative group rounded-xl shadow-lg overflow-hidden bg-gradient-to-r ${category.bgColor} text-white p-6 flex flex-col items-center justify-center transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                  <h2 className="text-2xl font-bold relative z-10 mb-2 text-center drop-shadow-md">{category.name}</h2>
                  <p className="text-sm font-medium opacity-90 relative z-10">{category.englishName}</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full">কোনো ফলাফল পাওয়া যায়নি। (No results found.)</p>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-4 text-lg font-medium">শুরু করুন আজই আপনার প্রস্তুতি—ফ্রি টেস্ট পান!</p>
          <Link href="/signUp">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              রেজিস্ট্রেশন করুন
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}