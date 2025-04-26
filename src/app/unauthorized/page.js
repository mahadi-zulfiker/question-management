// app/unauthorized/page.jsx
import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 p-4">
      <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transform transition-all duration-500 hover:scale-105">
        {/* Decorative Circle */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
          <FaExclamationTriangle className="text-4xl text-white" />
        </div>

        {/* Content */}
        <h1 className="mt-12 text-4xl font-extrabold text-gray-800 tracking-tight">
          Access Denied
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          You don’t have permission to access this page. Please contact support if you believe this is an error.
        </p>

        {/* Button */}
        <Link href="/">
          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-600 transition-all duration-300">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
}