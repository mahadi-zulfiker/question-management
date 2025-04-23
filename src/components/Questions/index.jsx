import React from "react";
import { HelpCircle, Users, CheckCircle } from "lucide-react";

const questions = [
  {
    title: "আনলিমিটেড প্রশ্ন",
    description: "আপনার প্রশ্ন জমা দিন এবং সীমাহীনভাবে দ্রুত ও সঠিক উত্তর পান।",
    icon: <HelpCircle className="text-blue-600 w-10 h-10" />,
  },
  {
    title: "তাৎক্ষণিক উত্তর",
    description: "আপনার প্রশ্নের জন্য দ্রুত এবং নির্ভরযোগ্য উত্তর পান আমাদের সহায়তা দলের মাধ্যমে।",
    icon: <Users className="text-blue-600 w-10 h-10" />,
  },
  {
    title: "নির্দিষ্ট প্রশ্ন ও সমাধান",
    description: "প্রতিটি প্রশ্নের জন্য সুনির্দিষ্ট এবং নির্ভুল সমাধান পান আমাদের প্ল্যাটফর্মে।",
    icon: <CheckCircle className="text-blue-600 w-10 h-10" />,
  },
];

function Questions() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-700">
            প্রশ্নের উত্তর জানতে চান?
          </h1>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            আমাদের প্ল্যাটফর্মে আপনার প্রশ্নের স্পষ্ট এবং নির্ভরযোগ্য উত্তর পান। যেকোনো বিষয়ে জানতে আমাদের সাথে যোগাযোগ করুন।
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