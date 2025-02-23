import React from "react";
import CountUp from "react-countup";
import { Users, BookOpen, GraduationCap, Star, HelpCircle } from "lucide-react";

const stats = [
  {
    icon: <Users className="text-indigo-600 w-12 h-12" />, 
    count: 5000, 
    label: "সন্তুষ্ট শিক্ষার্থী",
  },
  {
    icon: <GraduationCap className="text-green-600 w-12 h-12" />, 
    count: 200, 
    label: "মোট শিক্ষক",
  },
  {
    icon: <BookOpen className="text-blue-600 w-12 h-12" />, 
    count: 1200, 
    label: "সক্রিয় শিক্ষার্থী",
  },
  {
    icon: <Star className="text-yellow-500 w-12 h-12" />, 
    count: 98, 
    label: "পজিটিভ রেটিং (%)",
  },
  {
    icon: <HelpCircle className="text-red-500 w-12 h-12" />, 
    count: 3000, 
    label: "মোট প্রশ্ন",
  },
];

function Counter() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900">আমাদের অর্জন</h2>
        <p className="mt-4 text-lg text-gray-700">
          আমরা শিক্ষার্থীদের সাফল্যের জন্য কাজ করছি।
        </p>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-xl transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex justify-center">{stat.icon}</div>
              <h3 className="text-4xl font-bold text-gray-900 mt-5">
                <CountUp end={stat.count} duration={3} separator="," />
              </h3>
              <p className="text-gray-600 text-lg mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Counter;