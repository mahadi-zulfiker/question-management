"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

export default function ViewCircle() {
    const [circles, setCircles] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [editingCircleId, setEditingCircleId] = useState(null);
    const [newCircleName, setNewCircleName] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const [circlesRes, studentsRes] = await Promise.all([
                    axios.get("/api/viewCircle"),
                    axios.get("/api/viewCircle?students=true"),
                ]);
                setCircles(circlesRes.data);
                setStudents(studentsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("❌ ডেটা লোড করতে সমস্যা হয়েছে!");
            }
        }
        fetchData();
    }, []);

    const deleteCircle = async (id) => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই সার্কেল মুছতে চান?")) return;
        try {
            await axios.delete("/api/viewCircle", { data: { id } });
            setCircles(circles.filter((circle) => circle._id !== id));
            toast.success("✅ সার্কেল সফলভাবে মুছে ফেলা হয়েছে!");
        } catch (error) {
            console.error("Error deleting circle:", error);
            toast.error("❌ সার্কেল মুছতে সমস্যা হয়েছে!");
        }
    };

    const updateCircleName = async (id) => {
        if (!newCircleName) {
            toast.error("❌ নতুন নাম লিখুন!");
            return;
        }
        try {
            await axios.patch("/api/viewCircle", { id, circleName: newCircleName });
            setCircles(circles.map((circle) => (circle._id === id ? { ...circle, circleName: newCircleName } : circle)));
            setEditingCircleId(null);
            setNewCircleName("");
            toast.success("✅ সার্কেলের নাম আপডেট করা হয়েছে!");
        } catch (error) {
            console.error("Error updating circle:", error.response?.data || error);
            toast.error(`❌ আপডেট করতে সমস্যা হয়েছে! ${error.response?.data?.error || "অজানা ত্রুটি"}`);
        }
    };

    const addStudentToCircle = async (id) => {
        if (!selectedStudentId) {
            toast.error("❌ একজন ছাত্র নির্বাচন করুন!");
            return;
        }
        try {
            await axios.patch("/api/viewCircle", { id, action: "add", studentId: selectedStudentId });
            setCircles(
                circles.map((circle) =>
                    circle._id === id ? { ...circle, studentIds: [...circle.studentIds, selectedStudentId] } : circle
                )
            );
            setSelectedStudentId("");
            toast.success("✅ ছাত্র সফলভাবে যোগ করা হয়েছে!");
        } catch (error) {
            console.error("Error adding student:", error.response?.data || error);
            toast.error(`❌ ছাত্র যোগ করতে সমস্যা হয়েছে! ${error.response?.data?.error || "অজানা ত্রুটি"}`);
        }
    };

    const removeStudentFromCircle = async (id, studentId) => {
        try {
            await axios.patch("/api/viewCircle", { id, action: "remove", studentId });
            setCircles(
                circles.map((circle) =>
                    circle._id === id ? { ...circle, studentIds: circle.studentIds.filter((sid) => sid !== studentId) } : circle
                )
            );
            toast.success("✅ ছাত্র সফলভাবে মুছে ফেলা হয়েছে!");
        } catch (error) {
            console.error("Error removing student:", error.response?.data || error);
            toast.error(`❌ ছাত্র মুছতে সমস্যা হয়েছে! ${error.response?.data?.error || "অজানা ত্রুটি"}`);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gradient-to-b from-blue-50 to-gray-100 min-h-screen">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-700 drop-shadow-md">
                📚 ছাত্র সার্কেল সম্পাদনা
            </h1>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {circles.map((circle) => (
                    <motion.div
                        key={circle._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                    >
                        {/* Circle Name Section */}
                        {editingCircleId === circle._id ? (
                            <div className="flex items-center mb-4">
                                <input
                                    type="text"
                                    value={newCircleName}
                                    onChange={(e) => setNewCircleName(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-lg flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                    placeholder="নতুন সার্কেলের নাম"
                                />
                                <button
                                    onClick={() => updateCircleName(circle._id)}
                                    className="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setEditingCircleId(null)}
                                    className="ml-2 p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-800">{circle.circleName}</h2>
                                <button
                                    onClick={() => {
                                        setEditingCircleId(circle._id);
                                        setNewCircleName(circle.circleName);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Students List */}
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">ছাত্রদের তালিকা:</h3>
                            {circle.studentIds.length > 0 ? (
                                <ul className="space-y-2">
                                    {circle.studentIds.map((studentId) => {
                                        const student = students.find((s) => s._id === studentId);
                                        return (
                                            <motion.li
                                                key={studentId}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <span className="text-gray-800">
                                                    {student ? `${student.username} (${studentId.slice(-6)})` : studentId.slice(-6)}
                                                </span>
                                                <button
                                                    onClick={() => removeStudentFromCircle(circle._id, studentId)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">কোনো ছাত্র নেই</p>
                            )}
                        </div>

                        {/* Add Student Section */}
                        <div className="flex items-center mb-4">
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="p-2 border border-gray-300 rounded-lg flex-1 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all bg-white"
                            >
                                <option value="">ছাত্র নির্বাচন করুন</option>
                                {students
                                    .filter((student) => !circle.studentIds.includes(student._id))
                                    .map((student) => (
                                        <option key={student._id} value={student._id}>
                                            {student.username} ({student._id.slice(-6)})
                                        </option>
                                    ))}
                            </select>
                            <button
                                onClick={() => addStudentToCircle(circle._id)}
                                className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={() => deleteCircle(circle._id)}
                            className="w-full p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                        >
                            সার্কেল মুছুন
                        </button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}