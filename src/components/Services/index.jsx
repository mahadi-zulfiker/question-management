import React from "react";
import { BookOpen, Users, PenTool, Clock, Star } from "lucide-react";

const features = [
  [
    { text: "একাধিক টেক্সট কারা", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "বেসিক প্রশ্নকর ও সমাধান", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
    { text: "তৈরী প্রশ্নকর ও সমাধান", icon: <Star className="text-blue-600 w-6 h-6" /> },
    { text: "দৈনিক প্রশ্নকর ও মুল্যায়ন", icon: <Clock className="text-blue-600 w-6 h-6" /> },
    { text: "মাসিক প্রশ্নকর ও মূল্যায়ন", icon: <Users className="text-blue-600 w-6 h-6" /> },
  ],
  [
    { text: "অফলাইন প্রশ্নকর এম টেক্সট টিউটোরিয়াল", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "অনলাইন প্রশ্নকর টেক্সট মাত্র ২৫ টি দিন", icon: <Clock className="text-blue-600 w-6 h-6" /> },
    { text: "সকলের জন্য উপলব্ধ মোট টেক্সট", icon: <Users className="text-blue-600 w-6 h-6" /> },
    { text: "আমাদের কাজ", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
    { text: "আমাদের ফিল্টার কারা", icon: <Star className="text-blue-600 w-6 h-6" /> },
  ],
  [
    { text: "অংকিত প্রশ্নকা", icon: <PenTool className="text-blue-600 w-6 h-6" /> },
    { text: "সংলক টেক্সট", icon: <BookOpen className="text-blue-600 w-6 h-6" /> },
    { text: "অংকিত প্রশ্নকা", icon: <Star className="text-blue-600 w-6 h-6" /> },
    { text: "তুমি সহজেই প্রশ্নকা", icon: <Users className="text-blue-600 w-6 h-6" /> },
  ],
];

function Services() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500">
            আমাদের সাথে পড়াশোনা শুরু করুন
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-10 border border-gray-100/50 shadow-xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
            প্রশ্নবতস এর বিশেষ সুবিধা
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
              উক্ত করণ প্রদান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;