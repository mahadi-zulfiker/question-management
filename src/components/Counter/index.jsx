import React from "react";
import CountUp from "react-countup";
import { Users, BookOpen, GraduationCap, Star, HelpCircle } from "lucide-react";

const stats = [
  {
    icon: <Users className="text-blue-600 w-10 h-10" />,
    count: 5000,
    label: "খুশি শিক্ষার্থী",
  },
  {
    icon: <GraduationCap className="text-blue-600 w-10 h-10" />,
    count: 200,
    label: "বিশেষজ্ঞ শিক্ষক",
  },
  {
    icon: <BookOpen className="text-blue-600 w-10 h-10" />,
    count: 1200,
    label: "সক্রিয় শিক্ষার্থী",
  },
  {
    icon: <Star className="text-blue-600 w-10 h-10" />,
    count: 98,
    label: "ইতিবাচক রেটিং (%)",
  },
  {
    icon: <HelpCircle className="text-blue-600 w-10 h-10" />,
    count: 3000,
    label: "মোট প্রশ্ন",
  },
];

function Counter() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">
          আমাদের অর্জন
        </h2>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          আমরা শিক্ষার্থীদের সাফল্য ও শিক্ষার উন্নতির জন্য নিবেদিত।
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-2xl p-10 shadow-lg group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
              <div className="flex justify-center">{stat.icon}</div>
              <h3 className="text-5xl font-bold text-gray-900 mt-6">
                <CountUp end={stat.count} duration={3} separator="," />
              </h3>
              <p className="text-gray-600 text-xl mt-3">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Counter;