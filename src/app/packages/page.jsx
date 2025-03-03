"use client";
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import img from "../../../public/questionBanner.jpg";
import { useRouter } from 'next/navigation';

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchPackages() {
            try {
                const response = await axios.get('/api/package');
                setPackages(response.data);
            } catch (error) {
                console.error('Error fetching packages:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPackages();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="relative">
                <Image src={img} alt="Banner" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h2 className="text-5xl font-bold text-white text-center">আপনার পছন্দের প্যাকেজ নির্বাচন করুন</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto py-12 px-6">
                {loading ? (
                    <p className="text-center text-gray-600">লোড হচ্ছে...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 transition-all transform hover:scale-105">
                                <h3 className="text-3xl font-semibold text-gray-800 mb-2">{pkg.name}</h3>
                                <p className="text-gray-600 text-lg font-medium mb-4">মূল্য: ${pkg.cost}</p>
                                <p className="text-gray-700 mb-2">{pkg.description}</p>
                                <p className="text-blue-600 font-semibold mb-4">মেয়াদ: {pkg.validity}</p>
                                <p className="text-gray-600 mb-4">{pkg.benefits}</p>
                                <button 
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                                    onClick={() => router.push(`/checkout/${pkg._id}`)}
                                >
                                    কিনুন
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
