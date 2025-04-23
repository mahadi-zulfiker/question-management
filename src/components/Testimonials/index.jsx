import React from "react";
import { Code2, Users, PenTool } from "lucide-react";

const testimonials = [
  {
    name: "ফারজানা আক্তার",
    role: "ওয়েব ডেভেলপমেন্ট বুটক্যাম্প শিক্ষার্থী",
    content:
      "এই প্ল্যাটফর্ম আমার ওয়েব ডেভেলপমেন্ট দক্ষতা বাড়াতে অনেক সাহায্য করেছে। কোর্সগুলো তথ্যবহুল এবং সহজে বোঝার মতো।",
    icon: <Code2 className="text-blue-600 w-10 h-10" />,
  },
  {
    name: "মোহাম্মদ রাহিম",
    role: "ডাটা সায়েন্স শিক্ষার্থী",
    content:
      "ডাটা সায়েন্সের জগতে পা রাখার জন্য এটি একটি দুর্দান্ত কোর্স। নির্দেশনা স্পষ্ট এবং উদাহরণগুলো বাস্তব জীবনের সাথে মানানসই।",
    icon: <Users className="text-blue-600 w-10 h-10" />,
  },
  {
    name: "নুসরাত জাহান",
    role: "ইউআই/ইউএক্স ডিজাইন শিক্ষার্থী",
    content:
      "ইউআই/ইউএক্স ডিজাইনের মূল বিষয়গুলো শেখার জন্য এই কোর্স খুবই সহায়ক। এখন আমি আত্মবিশ্বাসের সাথে ডিজাইন করতে পারি।",
    icon: <PenTool className="text-blue-600 w-10 h-10" />,
  },
];

function Testimonials() {
  return (
    <section className="container mx-auto py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-gray-700 ">
            শিক্ষার্থীদের মতামত
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            আমাদের কোর্স সম্পর্কে শিক্ষার্থীদের অভিজ্ঞতা জানুন।
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white/80 backdrop-blur-md border border-gray-100/50 rounded-2xl p-10 shadow-lg group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"></div>
              <div className="flex justify-center">{testimonial.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mt-6 text-center">{testimonial.name}</h3>
              <p className="text-gray-500 text-base text-center mt-2">{testimonial.role}</p>
              <p className="mt-6 text-gray-600 text-lg italic leading-relaxed text-center">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;