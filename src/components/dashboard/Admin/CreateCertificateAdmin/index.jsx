"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function CreateCertificateAdmin() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dateIssued, setDateIssued] = useState("");
    const [signature, setSignature] = useState("");
    const [certificateId, setCertificateId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/createCertificate?students=true");
            setStudents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("❌ ছাত্রদের তথ্য লোড করতে সমস্যা!");
            setLoading(false);
        }
    };

    const handleCreateCertificate = async (e) => {
        e.preventDefault();
        if (!selectedStudentId || !title || !dateIssued || !signature) {
            toast.error("❌ সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন!");
            return;
        }

        try {
            const response = await axios.post("/api/createCertificate", {
                studentId: selectedStudentId,
                title,
                description,
                dateIssued,
                signature,
            });
            setCertificateId(response.data.id);
            toast.success("✅ সার্টিফিকেট সফলভাবে তৈরি হয়েছে!");
        } catch (error) {
            console.error("Error creating certificate:", error.response?.data || error);
            toast.error(`❌ সার্টিফিকেট তৈরি করতে সমস্যা! ${error.response?.data?.error || "অজানা ত্রুটি"}`);
        }
    };

    const handleIssueCertificate = async () => {
        if (!certificateId) {
            toast.error("❌ প্রথমে একটি সার্টিফিকেট তৈরি করুন!");
            return;
        }

        try {
            await axios.patch("/api/createCertificate", { certificateId });
            toast.success("✅ সার্টিফিকেট ছাত্রের কাছে প্রদান করা হয়েছে!");
            setCertificateId(null);
            setSelectedStudentId("");
            setTitle("");
            setDescription("");
            setDateIssued("");
            setSignature("");
        } catch (error) {
            console.error("Error issuing certificate:", error);
            toast.error("❌ সার্টিফিকেট প্রদানে সমস্যা!");
        }
    };

    const selectedStudent = students.find(s => s._id === selectedStudentId);

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                🏆 সার্টিফিকেট তৈরি ড্যাশবোর্ড
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
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="p-6 bg-white rounded-xl shadow-lg"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">সার্টিফিকেট তৈরি করুন</h2>
                        <form onSubmit={handleCreateCertificate} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">ছাত্র নির্বাচন করুন</label>
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                >
                                    <option value="">ছাত্র নির্বাচন করুন</option>
                                    {students.map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.username} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">সার্টিফিকেট শিরোনাম</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="যেমন: শ্রেষ্ঠত্বের সার্টিফিকেট"
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">বিবরণ (ঐচ্ছিক)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="সার্টিফিকেটের বিবরণ লিখুন"
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">প্রদানের তারিখ</label>
                                <input
                                    type="date"
                                    value={dateIssued}
                                    onChange={(e) => setDateIssued(e.target.value)}
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">শিক্ষকের স্বাক্ষর</label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    placeholder="আপনার নাম বা স্বাক্ষর লিখুন"
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                            >
                                সার্টিফিকেট তৈরি করুন
                            </button>
                        </form>
                        {certificateId && (
                            <button
                                onClick={handleIssueCertificate}
                                className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                            >
                                ছাত্রকে প্রদান করুন
                            </button>
                        )}
                    </motion.div>

                    {/* Enhanced Certificate Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="p-6 bg-white rounded-xl shadow-lg flex items-center justify-center"
                    >
                        {selectedStudentId && title && dateIssued && signature ? (
                            <div className="w-full max-w-md p-8 border-4 border-gold-600 bg-white rounded-lg shadow-inner relative overflow-hidden">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 left-0 w-16 h-16 bg-gold-200 rounded-full -translate-x-8 -translate-y-8 opacity-50"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gold-200 rounded-full translate-x-8 translate-y-8 opacity-50"></div>
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-500 to-gold-600"></div>
                                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-gold-500 to-gold-600"></div>

                                {/* Certificate Content */}
                                <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4 text-center border-b-2 border-gold-400 pb-2">
                                    {title}
                                </h3>
                                <p className="text-lg text-gray-700 mb-2 text-center">প্রদত্ত</p>
                                <p className="text-2xl font-semibold text-gray-800 mb-4 text-center">{selectedStudent?.username}</p>
                                <p className="text-sm text-gray-600 mb-4 text-center">ইমেইল: {selectedStudent?.email}</p>
                                <p className="text-gray-700 mb-6 text-center italic">{description || "একটি বিশেষ কৃতিত্বের জন্য।"}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">তারিখ: {new Date(dateIssued).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                                    <p className="text-sm text-gray-600 font-semibold">স্বাক্ষর: {signature}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-center">সার্টিফিকেটের পূর্বরূপ দেখতে সমস্ত ক্ষেত্র পূরণ করুন।</p>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}