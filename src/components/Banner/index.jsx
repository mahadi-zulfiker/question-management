import Image from "next/image";
import banner from "../../../public/teachBanner.jpg";

const Banner = () => {
  return (
    <section className="relative bg-black text-white py-36 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-700 opacity-60 blur-3xl"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 bg-blue-500 opacity-30 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      {/* Floating Dots for Decoration */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
      <div className="absolute top-32 right-20 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200"></div>
      <div className="absolute bottom-20 left-16 w-5 h-5 bg-indigo-400 rounded-full animate-bounce delay-300"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side: Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-blue-400 to-purple-500 text-gray-200 bg-clip-text drop-shadow-lg">
            দেশের প্রথম স্মার্ট এবং কাগজবিহীন<br className="hidden md:inline" /> প্রশ্নবতস!
          </h1>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed">
            প্রযুক্তির সাথে তাল মিলিয়ে শেখার নতুন অভিজ্ঞতা উপভোগ করুন।<br />
            আমাদের প্ল্যাটফর্মে পাবেন দ্রুত, নির্ভরযোগ্য ও বুদ্ধিবৃত্তিক সমাধান।
          </p>
          <ul className="mt-6 text-base text-gray-300 space-y-3 list-disc list-inside">
            <li>সহজ ও দ্রুত প্রশ্ন অনুসন্ধান</li>
            <li>বিশ্বাসযোগ্য ও সঠিক উত্তর</li>
            <li>বুদ্ধিবৃত্তিক বিশ্লেষণ ও ব্যাখ্যা</li>
            <li>শিক্ষার্থীদের জন্য কাস্টমাইজড লার্নিং অভিজ্ঞতা</li>
          </ul>
          <div className="mt-8 flex justify-center md:justify-start space-x-6">
            <a href="/" className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:opacity-90 hover:shadow-blue-400 transition">
              এক্সপ্লোর করুন
            </a>
            <a href="/createExam" className="px-6 py-3 rounded-lg font-semibold bg-white text-gray-900 shadow-lg hover:bg-gray-200 hover:shadow-lg transition">
              প্রশ্ন করুন
            </a>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="md:w-1/2 flex justify-center relative">
          <div className="relative w-full max-w-lg transform scale-110">
            <Image
              src={banner}
              alt="Future of Learning"
              className="rounded-lg shadow-2xl border-4 border-blue-400/30 drop-shadow-xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
