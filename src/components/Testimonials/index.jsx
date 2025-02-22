import React from "react";
import { UserCircle, Users, Code2, PenTool } from "lucide-react";

const testimonials = [
  {
    name: "সারাহ জনসন",
    role: "ওয়েব ডেভেলপমেন্ট বুটক্যাম্প শিক্ষার্থী",
    content:
      "এই প্ল্যাটফর্মটি আমার ওয়েব ডেভেলপমেন্ট দক্ষতা উন্নত করতে অনেক সাহায্য করেছে। কোর্সগুলি খুবই তথ্যবহুল এবং সহজবোধ্য।",
    icon: <Code2 className="text-indigo-600 w-12 h-12" />,
  },
  {
    name: "মার্ক উইলিয়ামস",
    role: "ডাটা সায়েন্স শিক্ষার্থী",
    content:
      "ডাটা সায়েন্সের জগতে প্রবেশ করার জন্য এটি একটি চমৎকার কোর্স। নির্দেশনাগুলি স্পষ্ট এবং উদাহরণগুলি বাস্তব জীবনের সাথে সম্পর্কিত।",
    icon: <Users className="text-blue-600 w-12 h-12" />,
  },
  {
    name: "এমিলি রবার্টস",
    role: "ইউআই/ইউএক্স ডিজাইন শিক্ষার্থী",
    content:
      "ইউআই/ইউএক্স ডিজাইনের মৌলিক বিষয়গুলি শেখার জন্য এই কোর্সটি অত্যন্ত সহায়ক ছিল। এখন আমি আত্মবিশ্বাসের সাথে ডিজাইন করতে পারি।",
    icon: <PenTool className="text-green-600 w-12 h-12" />,
  },
];

function Testimonials() {
  return (
    <section className="container mx-auto py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900">
            শিক্ষার্থীদের মতামত
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            আমাদের কোর্সগুলি সম্পর্কে শিক্ষার্থীদের অভিজ্ঞতা পড়ুন।
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-xl transition-transform transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="flex justify-center">{testimonial.icon}</div>
              <h3 className="text-2xl font-semibold text-gray-900 mt-5">
                {testimonial.name}
              </h3>
              <p className="text-gray-600 text-sm">{testimonial.role}</p>
              <p className="mt-4 text-gray-700 text-md italic">
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
