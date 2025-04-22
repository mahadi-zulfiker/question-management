import React from 'react';
import { FaFileAlt, FaBook, FaCheckCircle, FaClock } from 'react-icons/fa';

function SoftwareInfo() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            আমাদের সফটওয়্যার কেন বেছে নেবেন?
          </h1>
          <p className="text-lg text-blue-700 max-w-3xl mx-auto leading-relaxed">
            আমাদের প্ল্যাটফর্মের শক্তিশালী বৈশিষ্ট্যগুলি আবিষ্কার করুন যা আপনার অভিজ্ঞতা উন্নত করার জন্য ডিজাইন করা হয়েছে। সহজ ব্যবস্থাপনা থেকে নিরাপদ সমাধান পর্যন্ত, আমরা আপনাকে সবকিছু দিয়ে সমর্থন করি।
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="text-center mb-20">
          <button className="bg-blue-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-blue-700 transition duration-300">
            বৈশিষ্ট্যগুলি অন্বেষণ করুন
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-6">
              <FaFileAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">সহজ ব্যবস্থাপনা</h3>
            <p className="text-blue-600 leading-relaxed">
              আমাদের স্বজ্ঞাত ইন্টারফেসের মাধ্যমে আপনার কাজগুলি সহজেই ব্যবস্থাপনা করুন, যা দক্ষতার জন্য ডিজাইন করা হয়েছে।
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-6">
              <FaBook className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">বিস্তৃত গাইড</h3>
            <p className="text-blue-600 leading-relaxed">
              আমাদের প্ল্যাটফর্মের সর্বোচ্চ সুবিধা পেতে বিস্তারিত সংস্থানগুলি অ্যাক্সেস করুন।
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-6">
              <FaCheckCircle className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">নিরাপদ ও নির্ভরযোগ্য</h3>
            <p className="text-blue-600 leading-relaxed">
              আপনার ডেটা নিরাপদ ও অ্যাক্সেসযোগ্য রাখতে আমাদের নিরাপদ সিস্টেমের উপর ভরসা করুন।
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition duration-300">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-6">
              <FaClock className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-4">রিয়েল-টাইম আপডেট</h3>
            <p className="text-blue-600 leading-relaxed">
              তাৎক্ষণিক আপডেট এবং নোটিফিকেশনের মাধ্যমে সবসময় অবগত থাকুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoftwareInfo;