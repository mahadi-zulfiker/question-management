"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function Certificates() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            fetchCertificates(session.user.email);
        } else if (status === "unauthenticated") {
            setLoading(false); // Stop loading if not authenticated
        }
    }, [status, session]);

    const fetchCertificates = async (studentEmail) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/studentCertificate?studentEmail=${studentEmail}`);
            setCertificates(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching certificates:", error);
            toast.error("❌ সার্টিফিকেট লোড করতে সমস্যা!");
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                    🏆 আমার সার্টিফিকেট
                </h1>
                <p className="text-center text-gray-500 text-lg">
                    সার্টিফিকেট দেখতে দয়া করে লগইন করুন।
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                🏆 আমার সার্টিফিকেট
            </h1>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                </div>
            ) : certificates.length === 0 ? (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 text-lg"
                >
                    আপনার জন্য কোনো সার্টিফিকেট প্রদান করা হয়নি।
                </motion.p>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {certificates.map((certificate) => (
                        <motion.div
                            key={certificate._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 relative"
                        >
                            {/* Certificate Display */}
                            <div className="border-4 border-gold-600 p-6 rounded-lg bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 left-0 w-16 h-16 bg-gold-200 rounded-full -translate-x-8 -translate-y-8 opacity-50"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gold-200 rounded-full translate-x-8 translate-y-8 opacity-50"></div>
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-500 to-gold-600"></div>
                                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gold-500 to-gold-600"></div>

                                {/* Certificate Content */}
                                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4 text-center border-b-2 border-gold-400 pb-2">
                                    {certificate.title}
                                </h3>
                                <p className="text-lg text-gray-700 mb-2 text-center">প্রদত্ত</p>
                                <p className="text-xl font-semibold text-gray-800 mb-4 text-center">{certificate.studentName}</p>
                                <p className="text-sm text-gray-600 mb-4 text-center">ইমেইল: {certificate.studentEmail}</p>
                                <p className="text-gray-700 mb-6 text-center italic">{certificate.description || "একটি বিশেষ কৃতিত্বের জন্য।"}</p>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <p>তারিখ: {new Date(certificate.dateIssued).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                                    <p className="font-semibold">স্বাক্ষর: {certificate.signature}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}