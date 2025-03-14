import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
        {/* Brand and Description */}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-100">প্রশ্ন ব্যবস্থাপনা অ্যাপ</h2>
          <p className="text-base mt-6 text-gray-300 leading-relaxed">
            শিক্ষার্থীদের জন্য উন্নত ও সহজ প্রশ্ন ব্যবস্থাপনা প্ল্যাটফর্ম, যেখানে দক্ষতা বৃদ্ধি ও ভর্তি প্রস্তুতি নেওয়া যায়।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-gray-100">দ্রুত লিংক</h3>
          <ul className="mt-6 space-y-4 text-gray-300">
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">হোম</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">কোর্সসমূহ</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">ব্লগ</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">যোগাযোগ</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">সাহায্য কেন্দ্র</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-semibold text-gray-100">আমাদের সেবা</h3>
          <ul className="mt-6 space-y-4 text-gray-300">
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">প্রশ্ন ব্যাংক</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">লাইভ ক্লাস</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">অনলাইন পরীক্ষা</a></li>
            <li><a href="#" className="hover:text-blue-300 transition-colors duration-200 text-base">ক্যারিয়ার গাইড</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-gray-100">আমাদের অনুসরণ করুন</h3>
          <div className="flex justify-center md:justify-start space-x-6 mt-6">
            <a href="#" className="text-gray-300 hover:text-blue-400 hover:scale-110 transition-all duration-300"><Facebook size={28} /></a>
            <a href="#" className="text-gray-300 hover:text-blue-300 hover:scale-110 transition-all duration-300"><Twitter size={28} /></a>
            <a href="#" className="text-gray-300 hover:text-blue-500 hover:scale-110 transition-all duration-300"><Linkedin size={28} /></a>
            <a href="#" className="text-gray-300 hover:text-pink-400 hover:scale-110 transition-all duration-300"><Instagram size={28} /></a>
            <a href="#" className="text-gray-300 hover:text-red-500 hover:scale-110 transition-all duration-300"><Youtube size={28} /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 text-base mt-12 border-t border-gray-700/50 pt-8">
        © {new Date().getFullYear()} প্রশ্ন ব্যবস্থাপনা অ্যাপ. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

export default Footer;