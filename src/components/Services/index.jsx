import React from "react";
import { BookOpen, Users, PenTool, Clock, Star } from "lucide-react";

const features = [
  [
    { text: "বিভিন্ন শিক্ষা সামগ্রী", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "মৌলিক প্রশ্ন ও সমাধান", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
    { text: "তৈরি প্রশ্নপত্র ও সমাধান", icon: <Star className="text-blue-600 w-6 h-6" /> },
    { text: "দৈনিক প্রশ্ন ও মূল্যায়ন", icon: <Clock className="text-blue-600 w-6 h-6" /> },
  ],
  [
    { text: "অফলাইন শিক্ষা টিউটোরিয়াল", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "অনলাইন প্রশ্ন সমাধান সেবা", icon: <Clock className="text-blue-600 w-6 h-6" /> },
    { text: "সকলের জন্য উন্মুক্ত কোর্স", icon: <Users className="text-blue-600 w-6 h-6" /> },
    { text: "ব্যক্তিগতকৃত শিক্ষা পরিকল্পনা", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
  ],
  [
    { text: "গণিত ও বিজ্ঞান প্রশ্ন", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
    { text: "বিষয়ভিত্তিক শিক্ষা সামগ্রী", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "উন্নত প্রশ্ন সমাধান", icon: <Star className="text-blue-600 w-6 h-6" /> },
    { text: "সহজ প্রশ্ন অনুসন্ধান", icon: <Users className="text-blue-600 w-6 h-6" /> },
  ],
];

function Services() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
            আমাদের সাথে পড়াশোনা শুরু করুন
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 border border-gray-100/50 shadow-xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
            প্রশ্নব্যাংকের বিশেষ সুবিধা
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((column, colIndex) => (
              <div key={colIndex} className="space-y-6">
                {column.map((feature, index) => (
                  <p
                    key={index}
                    className="flex items-center text-gray-700 text-xl animate-fadeInUp"
                    style={{ animationDelay: `${(colIndex * column.length + index) * 100}ms` }}
                  >
                    <span className="mr-4">{feature.icon}</span>
                    {feature.text}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-5 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
              এখনই শুরু করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;