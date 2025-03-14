import React from "react";

function ExtraInfo() {
  const steps = [
    { number: "১", text: "কাস্টমাইজড লার্নিং পাথ" },
    { number: "২", text: "বিশেষজ্ঞ প্রশিক্ষকবৃন্দ" },
    { number: "৩", text: "ইন্টারেক্টিভ কুইজ এবং অ্যাসাইনমেন্ট" },
    { number: "৪", text: "কমিউনিটি সাপোর্ট" },
  ];

  return (
    <div
      className="bg-gradient-to-b from-gray-50 to-white shadow-2xl rounded-xl p-10 my-24 max-w-6xl mx-auto"
    >
      <h2 className="text-5xl font-extrabold text-gray-700 mb-8 text-center border-b-4 border-blue-300 pb-4">
        অতিরিক্ত তথ্য
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Section: Numbered Steps with Arrows */}
        <div className="flex-1 space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-6 animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-4xl font-bold text-white bg-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                {step.number}
              </span>
              <p className="text-gray-800 text-xl font-semibold">{step.text}</p>
            </div>
          ))}
        </div>

        {/* Right Section: Visual Element or Text */}
        <div className="flex-1">
          <div className="bg-blue-50 backdrop-blur-md rounded-xl p-6 border border-blue-200 shadow-md">
            <p className="text-gray-700 text-center text-lg">
              আমাদের প্ল্যাটফর্মে আপনাকে স্বাগতম! আমরা বিভিন্ন কোর্স অফার করি যা আপনার শেখার অভিজ্ঞতা উন্নত করতে সহায়তা করবে।
            </p>
            <div className="mt-6 flex justify-center">
              <a
                href="#"
                className="text-blue-600 font-semibold text-lg hover:text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-full transition-all duration-300"
              >
                আরও জানুন →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtraInfo;