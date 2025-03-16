import Image from "next/image";
import banner from "../../../public/teachBanner.jpg";

const Banner = () => {
  return (
    <section className="relative bg-blue-900 text-white py-44 overflow-hidden">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-blue-800/50 to-blue-600/50"></div>
      {/* Wave Effect with Tailwind Animation */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 w-full h-40 text-blue-800/30 animate-[wave_10s_ease-in-out_infinite]"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C280,80 720,20 1440,80 V100 H0 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-20">
        {/* Left Side: Text */}
        <div className="md:w-1/2 text-center md:text-left animate-fadeInUp">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500 drop-shadow-md">
            দেশের প্রথম স্মার্ট এবং কাগজবিহীন<br className="hidden md:inline" /> প্রশ্নব্যাংক!
          </h1>
          <p className="mt-8 text-xl text-gray-200 leading-relaxed max-w-lg mx-auto md:mx-0">
            প্রযুক্তির সাথে তাল মিলিয়ে শেখার নতুন অভিজ্ঞতা উপভোগ করুন। আমাদের প্ল্যাটফর্মে পাবেন দ্রুত, নির্ভরযোগ্য ও বুদ্ধিবৃত্তিক সমাধান।
          </p>
          <ul className="mt-8 text-lg text-gray-200 space-y-4 list-disc list-inside max-w-lg mx-auto md:mx-0">
            <li>সহজ ও দ্রুত প্রশ্ন অনুসন্ধান</li>
            <li>বিশ্বাসযোগ্য ও সঠিক উত্তর</li>
            <li>বুদ্ধিবৃত্তিক বিশ্লেষণ ও ব্যাখ্যা</li>
            <li>শিক্ষার্থীদের জন্য কাস্টমাইজড লার্নিং অভিজ্ঞতা</li>
          </ul>
          <div className="mt-12 flex justify-center md:justify-start space-x-8">
            <a
              href="/"
              className="px-10 py-5 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:scale-105 hover:shadow-blue-500/50 transition-all duration-300"
            >
              এক্সপ্লোর করুন
            </a>
            <a
              href="/createExam"
              className="px-10 py-5 rounded-full font-semibold bg-white text-blue-900 shadow-lg hover:bg-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              প্রশ্ন করুন
            </a>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="md:w-1/2 flex justify-center relative animate-fadeInUp">
          <div className="relative w-full max-w-xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"></div>
            <Image
              src={banner}
              alt="Future of Learning"
              className="rounded-lg shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;