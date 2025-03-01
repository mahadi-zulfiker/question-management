import React from 'react';

function Questions() {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-red-500 mb-2">
          প্রশ্নের উত্তর জানতে চান?
        </h1>
        <p className="text-gray-600 mb-4">
          পারিপার্শ্বিক ও কার্যক্ষেত্রের আগ্রহী সম্পর্কে তথ্য। আপনি কি নির্দিষ্ট বা মোটা আকারে তথ্যি করতে চান? আপনি উত্তরের সঙ্গে ৩০ দিন রিটার্ন পলিসি বা হার টার্গেট করে কাজ করতে পারেন।
        </p>
        <button className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition duration-300">
          প্রশ্নের উত্তর জানুন
        </button>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300">
          <div className="flex justify-center mb-4">
            <span className="text-3xl text-green-500">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            আনলিমিটেড প্রশ্ন
          </h3>
          <p className="text-gray-600 text-center">
            প্রতি উত্তরের জন্য টিকেট দিয়ে সহজে কাজ করা যাবে হারাধ।
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300">
          <div className="flex justify-center mb-4">
            <span className="text-3xl text-green-500">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            আগ্রহী উত্তর পাবি
          </h3>
          <p className="text-gray-600 text-center">
            প্রশ্নের কল সেবা দিয়ে তাৎক্ষণিক উত্তর পাবে তুমি।
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-green-200 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300">
          <div className="flex justify-center mb-4">
            <span className="text-3xl text-green-500">
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
            নির্দিষ্ট প্রশ্ন ও সমাধান
            </h3>
          <p className="text-gray-600 text-center">
            সকল প্রশ্নের জন্য নির্দিষ্ট ও সঠিক সমাধান রয়েছে সঙ্গে সায়ান।
          </p>
        </div>
      </div>
    </div>
  );
}

export default Questions;