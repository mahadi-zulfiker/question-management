"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function ViewCertificateAdmin() {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ title: "", description: "", signature: "", dateIssued: "" });

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/viewCertificate");
            setCertificates(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching certificates:", error);
            toast.error("❌ সার্টিফিকেট লোড করতে সমস্যা!");
            setLoading(false);
        }
    };

    const handleEdit = (certificate) => {
        setEditingId(certificate._id);
        setEditForm({
            title: certificate.title,
            description: certificate.description,
            signature: certificate.signature,
            dateIssued: certificate.dateIssued.split("T")[0], // Format for input[type="date"]
        });
    };

    const handleUpdate = async (certificateId) => {
        try {
            const response = await axios.patch("/api/viewCertificate", {
                certificateId,
                ...editForm,
            });
            setCertificates(certificates.map(c => 
                c._id === certificateId ? { ...c, ...editForm, dateIssued: new Date(editForm.dateIssued) } : c
            ));
            setEditingId(null);
            toast.success("✅ সার্টিফিকেট আপডেট করা হয়েছে!");
        } catch (error) {
            console.error("Error updating certificate:", error);
            toast.error("❌ সার্টিফিকেট আপডেটে সমস্যা!");
        }
    };

    const handleDelete = async (certificateId) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই সার্টিফিকেট মুছতে চান?")) return;
        try {
            await axios.delete("/api/viewCertificate", { data: { certificateId } });
            setCertificates(certificates.filter(c => c._id !== certificateId));
            toast.success("✅ সার্টিফিকেট মুছে ফেলা হয়েছে!");
        } catch (error) {
            console.error("Error deleting certificate:", error);
            toast.error("❌ সার্টিফিকেট মুছতে সমস্যা!");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                🏆 সার্টিফিকেট দেখুন এবং পরিচালনা করুন
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
                    কোনো সার্টিফিকেট পাওয়া যায়নি।
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
                            {editingId === certificate._id ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        placeholder="শিরোনাম"
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        placeholder="বিবরণ"
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        rows="3"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.signature}
                                        onChange={(e) => setEditForm({ ...editForm, signature: e.target.value })}
                                        placeholder="স্বাক্ষর"
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <input
                                        type="date"
                                        value={editForm.dateIssued}
                                        onChange={(e) => setEditForm({ ...editForm, dateIssued: e.target.value })}
                                        className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdate(certificate._id)}
                                            className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                        >
                                            সংরক্ষণ
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                                        >
                                            বাতিল
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Certificate Display */}
                                    <div className="border-2 border-gold-400 p-4 rounded-lg bg-gradient-to-br from-white to-gray-50">
                                        <h3 className="text-xl font-serif font-bold text-gray-800 mb-2 text-center">{certificate.title}</h3>
                                        <p className="text-gray-700 mb-1">ছাত্র: {certificate.studentName}</p>
                                        <p className="text-gray-700 mb-1">ইমেইল: {certificate.studentEmail}</p>
                                        <p className="text-gray-700 mb-1 italic">{certificate.description || "কোনো বিবরণ নেই"}</p>
                                        <p className="text-gray-700 mb-1">তারিখ: {new Date(certificate.dateIssued).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" })}</p>
                                        <p className="text-gray-700">স্বাক্ষর: {certificate.signature}</p>
                                        <p className="text-sm text-gray-500 mt-2">প্রদান: {certificate.issued ? "হ্যাঁ" : "না"}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(certificate)}
                                            className="flex-1 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                                        >
                                            সম্পাদনা
                                        </button>
                                        <button
                                            onClick={() => handleDelete(certificate._id)}
                                            className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                        >
                                            মুছুন
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}