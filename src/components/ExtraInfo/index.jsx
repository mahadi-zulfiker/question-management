import React from 'react';

function ExtraInfo() {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-6xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b-2 border-green-500 pb-2">
        অতিরিক্ত তথ্য
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section: Numbered Steps with Arrows (Similar to Screenshot) */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-500 bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">
              ১
            </span>
            <p className="text-gray-700">কাস্টমাইজড লার্নিং পাথ</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-500 bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">
              ২
            </span>
            <p className="text-gray-700">বিশেষজ্ঞ প্রশিক্ষকবৃন্দ</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-500 bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">
              ৩
            </span>
            <p className="text-gray-700">ইন্টারেক্টিভ কুইজ এবং অ্যাসাইনমেন্ট</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-green-500 bg-green-100 p-2 rounded-full w-12 h-12 flex items-center justify-center">
              ৪
            </span>
            <p className="text-gray-700">কমিউনিটি সাপোর্ট</p>
          </div>
        </div>

        {/* Right Section: Visual Element or Image (Placeholder for Screenshot-like Design) */}
        <div className="flex-1">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-md">
            <p className="text-gray-600 text-center">
              আমাদের প্ল্যাটফর্মে আপনাকে স্বাগতম! আমরা বিভিন্ন কোর্স অফার করি যা আপনার শেখার অভিজ্ঞতা উন্নত করতে সহায়তা করবে।
            </p>
            <div className="mt-4 flex justify-center">
              <span className="text-green-500 font-semibold">
                আরও জানুন &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtraInfo;