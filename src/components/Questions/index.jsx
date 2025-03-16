import React from "react";
import { HelpCircle, Users, CheckCircle } from "lucide-react";

const questions = [
  {
    title: "আনলিমিটেড প্রশ্ন",
    description: "প্রতি উত্তরের জন্য টিকেট দিয়ে সহজে কাজ করা যাবে হারাধ।",
    icon: <HelpCircle className="text-blue-600 w-10 h-10" />,
  },
  {
    title: "আগ্রহী উত্তর পাবে",
    description: "প্রশ্নের কল সেবা দিয়ে তাৎক্ষণিক উত্তর পাবে তুমি।",
    icon: <Users className="text-blue-600 w-10 h-10" />,
  },
  {
    title: "নির্দিষ্ট প্রশ্ন ও সমাধান",
    description: "সকল প্রশ্নের জন্য নির্দিষ্ট ও সঠিক সমাধান রয়েছে সঙ্গে সায়ান।",
    icon: <CheckCircle className="text-blue-600 w-10 h-10" />,
  },
];

function Questions() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
            প্রশ্নের উত্তর জানতে চান?
          </h1>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            পারিপার্শ্বিক ও কার্যক্ষেত্রের আগ্রহী সম্পর্কে তথ্য। আপনি কি নির্দিষ্ট বা মোটা আকারে তথ্যি করতে চান? আপনি উত্তরের সঙ্গে ৩০ দিন রিটার্ন পলিসি বা হার টার্গেট করে কাজ করতে পারেন।
          </p>
          <button className="mt-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-10 py-5 rounded-full font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300">
            প্রশ্নের উত্তর জানুন
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {questions.map((item, index) => (
            <div
              key={index}
              className="relative bg-white/80 backdrop-blur-md rounded-xl p-8 border border-gray-100/50 shadow-lg group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              <div className="flex justify-center mb-6">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">{item.title}</h3>
              <p className="text-gray-600 text-lg text-center">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Questions;