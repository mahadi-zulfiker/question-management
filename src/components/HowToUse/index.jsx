import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

function HowToUse() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            সফটওয়্যারটি কীভাবে ব্যবহার করবেন?
          </h1>
          <p className="text-lg text-blue-700 max-w-3xl mx-auto leading-relaxed">
            আমাদের সফটওয়্যারটি ব্যবহার করা খুবই সহজ! নিচের ধাপগুলো অনুসরণ করুন এবং দ্রুত শুরু করুন।
          </p>
        </div>

        {/* Steps Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Steps List */}
          <div className="space-y-10 w-full lg:w-1/2">
            {/* Step 1 */}
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-6">
                ১
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">নিবন্ধন করুন</h3>
                <p className="text-blue-600 leading-relaxed">
                  আমাদের ওয়েবসাইটে আপনার তথ্য দিয়ে নিবন্ধন করুন এবং একটি অ্যাকাউন্ট তৈরি করুন।
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-6">
                ২
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">বৈশিষ্ট্যগুলো জানুন</h3>
                <p className="text-blue-600 leading-relaxed">
                  আমাদের সফটওয়্যারের বিভিন্ন বৈশিষ্ট্যগুলো সম্পর্কে জানুন এবং কীভাবে সেগুলো ব্যবহার করবেন তা শিখুন।
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-6">
                ৩
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">প্রশ্ন তৈরি করুন</h3>
                <p className="text-blue-600 leading-relaxed">
                  আপনার প্রয়োজন অনুযায়ী প্রশ্ন তৈরি করুন এবং সেগুলো সংরক্ষণ করুন।
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mr-6">
                ৪
              </div>
              <div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">পরীক্ষা দিন ও পরিচালনা করুন</h3>
                <p className="text-blue-600 leading-relaxed">
                  পরীক্ষা দিন এবং আপনার ছাত্রদের জন্য পরীক্ষা পরিচালনা করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="w-full lg:w-1/2">
            <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Laptop outline */}
              <rect x="50" y="30" width="300" height="200" rx="10" fill="#E3F2FD"/>
              <rect x="50" y="230" width="300" height="20" rx="5" fill="#90CAF9"/>
              
              {/* Screen content */}
              <rect x="60" y="40" width="280" height="180" fill="#BBDEFB"/>
              {/* Sidebar */}
              <rect x="60" y="40" width="60" height="180" fill="#42A5F5"/>
              {/* List items in sidebar */}
              <rect x="70" y="50" width="40" height="10" rx="2" fill="#1976D2"/>
              <rect x="70" y="70" width="40" height="10" rx="2" fill="#1976D2"/>
              <rect x="70" y="90" width="40" height="10" rx="2" fill="#1976D2"/>
              {/* Main content */}
              <rect x="130" y="50" width="200" height="60" rx="5" fill="#E3F2FD"/>
              <rect x="130" y="120" width="200" height="90" rx="5" fill="#E3F2FD"/>
              
              {/* Question mark icon */}
              <path d="M190 150 Q200 130 210 150 Q220 170 200 180 Q180 170 190 150" fill="none" stroke="#1976D2" stroke-width="4"/>
              <circle cx="200" cy="190" r="4" fill="#1976D2"/>
            </svg>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <a
            href="#get-started"
            className="inline-flex items-center bg-blue-600 text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:bg-blue-700 transition duration-300"
          >
            শুরু করুন
            <FaArrowRight className="ml-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default HowToUse;