"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import Image from "next/image";
import img from "../../../public/course.jpg";
import banner from "../../../public/questionBanner.jpg";

const books = [
  { id: 1, name: "ঢাকা বিশ্ববিদ্যালয় \"ঘ\" ইউনিট", category: "DU", price: 49, duration: "১ বছর", transliteration: "dhaka bishwobidyaloy g unit" },
  { id: 2, name: "গুচ্ছ খ প্রশ্নব্যাংক", category: "GST B", price: 49, duration: "৬ মাস", transliteration: "guccho kha prosnobank" },
  { id: 3, name: "কুয়েট প্রশ্নব্যাংক", category: "KUET", price: 49, duration: "৬ মাস", transliteration: "kuet prosnobank" },
  { id: 4, name: "ভার্সিটি 'খ' প্রশ্নব্যাংক", category: "Varsity Kha", price: 49, duration: "১ বছর", transliteration: "varsity kha prosnobank" },
  { id: 5, name: "ঢাবি খ প্রশ্নব্যাংক", category: "DU B", price: 49, duration: "১ বছর", transliteration: "dhabi kha prosnobank" },
  { id: 6, name: "চুয়েট প্রশ্নব্যাংক", category: "CUET", price: 59, duration: "১ বছর", transliteration: "cuet prosnobank" },
  { id: 7, name: "রুয়েট প্রশ্নব্যাংক", category: "RUET", price: 59, duration: "৬ মাস", transliteration: "ruet prosnobank" },
  { id: 8, name: "বুয়েট ভর্তি প্রস্তুতি", category: "BUET", price: 99, duration: "১ বছর", transliteration: "buet vorti prostuti" },
  { id: 9, name: "মেডিকেল প্রশ্নব্যাংক", category: "Medical", price: 89, duration: "৯ মাস", transliteration: "medical prosnobank" },
  { id: 10, name: "আইবিএ প্রস্তুতি গাইড", category: "IBA", price: 69, duration: "৬ মাস", transliteration: "iba prostuti guide" },
];

export default function Bookshelf() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const filteredBooks = books.filter((book) => {
    const searchLower = search.toLowerCase();
    return (
      (book.name.includes(search) ||
        book.transliteration.toLowerCase().includes(searchLower)) &&
      (filter === "" || book.category === filter)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="relative w-full h-96 mb-8">
        <Image
          src={banner}
          alt="Banner"
          layout="fill"
          objectFit="cover"
          className="rounded-b-3xl"
        />
        <h1 className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-white drop-shadow-lg">
          প্রশ্নব্যাংক সংগ্রহ
        </h1>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <input
            type="text"
            placeholder="প্রশ্নব্যাংক সার্চ করুন"
            className="border p-3 flex-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#24104f]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#24104f]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">সব</option>
            {[...new Set(books.map((book) => book.category))].map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300"
            >
              <div className="relative w-full h-48">
                <Image
                  src={img}
                  alt={book.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {book.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{book.category}</p>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-[#24104f]">৳ {book.price}</p>
                  <p className="text-sm text-gray-600">সময়ঃ {book.duration}</p>
                </div>

                <button className="mt-4 w-full bg-[#24104f] text-white py-2 rounded-lg hover:bg-[#1b0a37] transition">
                  বিস্তারিত দেখুন
                </button>
              </div>
            </div>
          ))}

          {filteredBooks.length === 0 && (
            <p className="text-center col-span-full text-gray-600 text-lg">
              কোন প্রশ্নব্যাংক পাওয়া যায়নি।
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
