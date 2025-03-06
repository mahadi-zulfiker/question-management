"use client";

import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CheckCircle, AlertTriangle } from "lucide-react";

const classes = Array.from({ length: 9 }, (_, i) => i + 4);
const levels = { 9: "SSC", 10: "SSC", 11: "HSC", 12: "HSC" };
const subjectParts = ["None", "1st", "2nd"];

export default function CreateClass() {
    const [classNumber, setClassNumber] = useState(4);
    const [subject, setSubject] = useState("");
    const [chapterNumber, setChapterNumber] = useState("");
    const [chapterName, setChapterName] = useState("");
    const [subjectPart, setSubjectPart] = useState("None");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !chapterNumber || !chapterName) {
            toast.error("Please fill in all fields", { icon: <AlertTriangle className="text-red-500" /> });
            return;
        }
        try {
            const res = await fetch("/api/createClass", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    classNumber,
                    level: levels[classNumber] || null,
                    subject,
                    chapterNumber,
                    chapterName,
                    subjectPart,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Class created successfully!", { icon: <CheckCircle className="text-green-500" /> });
                setSubject("");
                setChapterNumber("");
                setChapterName("");
                setSubjectPart("None");
            } else {
                toast.error(data.message || "Something went wrong", { icon: <AlertTriangle className="text-red-500" /> });
            }
        } catch (error) {
            toast.error("Failed to create class", { icon: <AlertTriangle className="text-red-500" /> });
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-gray-100 shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Class</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-lg font-medium text-gray-700">Select Class</label>
                    <select
                        value={classNumber}
                        onChange={(e) => setClassNumber(Number(e.target.value))}
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {classes.map((cls) => (
                            <option key={cls} value={cls}>
                                {cls} {levels[cls] ? `(${levels[cls]})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700">Subject Name</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Enter subject name"
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700">Chapter Number</label>
                    <input
                        type="number"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(Number(e.target.value))}
                        placeholder="Enter chapter number"
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700">Chapter Name</label>
                    <input
                        type="text"
                        value={chapterName}
                        onChange={(e) => setChapterName(e.target.value)}
                        placeholder="Enter chapter name"
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-700">Subject Part</label>
                    <select
                        value={subjectPart}
                        onChange={(e) => setSubjectPart(e.target.value)}
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {subjectParts.map((part) => (
                            <option key={part} value={part}>{part}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Create
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />
        </div>
    );
}