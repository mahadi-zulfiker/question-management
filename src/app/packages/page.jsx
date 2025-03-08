"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100">
            <Navbar />
            <div className="relative">
                <Image
                    src="/questionBanner.jpg"
                    alt="Banner"
                    className="w-full h-72 object-cover"
                    width={1200}
                    height={288}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h2 className="text-5xl font-extrabold text-white text-center drop-shadow-lg">
                        আপনার পছন্দের প্যাকেজ নির্বাচন করুন
                    </h2>
                </div>
            </div>
            <div className="max-w-7xl mx-auto py-16 px-6">
                {loading ? (
                    <p className="text-center text-blue-700 text-2xl py-8 animate-pulse">লোড হচ্ছে...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <div
                                key={pkg._id}
                                className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 hover:bg-blue-50/50 transition-all transform hover:-translate-y-2 duration-300"
                            >
                                <h3 className="text-3xl font-semibold text-indigo-900 mb-4">{pkg.name}</h3>
                                <p className="text-blue-700 text-xl font-medium mb-3">৳{pkg.cost}</p>
                                <p className="text-gray-700 mb-3">{pkg.description}</p>
                                <p className="text-blue-600 font-medium mb-3">মেয়াদ: {pkg.validity}</p>
                                <p className="text-gray-600 mb-5">{pkg.benefits}</p>
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
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <Footer />
        </div>
    );
}