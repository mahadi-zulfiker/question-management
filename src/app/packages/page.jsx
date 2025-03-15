"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch("/api/package");
        const data = await response.json();
        if (response.ok) {
          setPackages(data);
        } else {
          toast.error("Failed to fetch packages");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Error fetching packages");
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {/* Banner Section */}
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            আপনার পছন্দের প্যাকেজ নির্বাচন করুন
          </h1>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fadeInUp"
                  style={{ animationDelay: `${packages.indexOf(pkg) * 0.1}s` }}
                >
                  <h3 className="text-3xl font-semibold text-indigo-900 mb-4">{pkg.name}</h3>
                  <p className="text-blue-700 text-xl font-medium mb-3">৳{pkg.cost}</p>
                  <p className="text-gray-700 mb-3 line-clamp-3">{pkg.description}</p>
                  <p className="text-blue-600 font-medium mb-3">মেয়াদ: {pkg.validity}</p>
                  <p className="text-gray-600 mb-5 line-clamp-3">{pkg.benefits}</p>
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-semibold shadow-md"
                    onClick={() => router.push(`/checkout/${pkg._id}`)}
                  >
                    কিনুন
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Footer />
    </div>
  );
}