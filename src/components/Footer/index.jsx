import React from 'react';
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-gray-900 text-white py-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
        {/* Brand and Description */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100">প্রশ্ন ব্যবস্থাপনা অ্যাপ</h2>
          <p className="text-sm mt-3 text-gray-300">
            শিক্ষার্থীদের জন্য উন্নত ও সহজ প্রশ্ন ব্যবস্থাপনা প্ল্যাটফর্ম, যেখানে
            দক্ষতা বৃদ্ধি ও ভর্তি প্রস্তুতি নেওয়া যায়।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100">দ্রুত লিংক</h3>
          <ul className="mt-4 space-y-3 text-gray-300">
            <li><a href="#" className="hover:text-gray-300">হোম</a></li>
            <li><a href="#" className="hover:text-gray-300">কোর্সসমূহ</a></li>
            <li><a href="#" className="hover:text-gray-300">ব্লগ</a></li>
            <li><a href="#" className="hover:text-gray-300">যোগাযোগ</a></li>
            <li><a href="#" className="hover:text-gray-300">সাহায্য কেন্দ্র</a></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100">আমাদের সেবা</h3>
          <ul className="mt-4 space-y-3 text-gray-300">
            <li><a href="#" className="hover:text-gray-300">প্রশ্ন ব্যাংক</a></li>
            <li><a href="#" className="hover:text-gray-300">লাইভ ক্লাস</a></li>
            <li><a href="#" className="hover:text-gray-300">অনলাইন পরীক্ষা</a></li>
            <li><a href="#" className="hover:text-gray-300">ক্যারিয়ার গাইড</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100">আমাদের অনুসরণ করুন</h3>
          <div className="flex justify-center md:justify-start space-x-4 mt-4">
            <a href="#" className="hover:text-blue-400"><FaFacebook size={28} /></a>
            <a href="#" className="hover:text-blue-300"><FaTwitter size={28} /></a>
            <a href="#" className="hover:text-blue-500"><FaLinkedin size={28} /></a>
            <a href="#" className="hover:text-pink-400"><FaInstagram size={28} /></a>
            <a href="#" className="hover:text-red-500"><FaYoutube size={28} /></a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-400 text-sm mt-10 border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()} প্রশ্ন ব্যবস্থাপনা অ্যাপ. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}

export default Footer;
