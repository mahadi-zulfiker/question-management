"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

export default function CreateCQAdmin() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState("");
    const [selectedChapterName, setSelectedChapterName] = useState("");
    const [subjectParts, setSubjectParts] = useState([]);
    const [selectedSubjectPart, setSelectedSubjectPart] = useState("");
    const [cqType, setCQType] = useState("");
    const [isMultipleCQs, setIsMultipleCQs] = useState(false);

    const [cqs, setCQs] = useState([{
        passage: "",
        questions: ["", "", "", ""],
        mathQuestions: ["", "", ""],
        image: null,
        imageAlignment: "center", // Added image alignment
    }]);

    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/cq");
                const data = await res.json();
                setClasses(data);
            } catch (error) {
                toast.error("Failed to load classes");
            }
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) return;
            try {
                const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
                const data = await res.json();
                if (data.length > 0) {
                    setSubjects([...new Set(data.map((item) => item.subject))]);
                    setSubjectParts([...new Set(data.map((item) => item.subjectPart).filter(part => part))]);
                    setChapters([...new Set(data.map((item) => ({
                        number: item.chapterNumber,
                        name: item.chapterName
                    })))]);
                }
            } catch (error) {
                toast.error("Failed to load class data");
            }
        }
        fetchClassData();
    }, [selectedClass]);

    const addNewCQ = () => {
        setCQs([...cqs, {
            passage: "",
            questions: ["", "", "", ""],
            mathQuestions: ["", "", ""],
            image: null,
            imageAlignment: "center",
        }]);
    };

    const handlePassageChange = (index, value) => {
        const newCQs = [...cqs];
        newCQs[index].passage = value;
        setCQs(newCQs);
    };

    const handleQuestionChange = (cqIndex, qIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].questions[qIndex] = value;
        setCQs(newCQs);
    };

    const handleMathQuestionChange = (cqIndex, qIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].mathQuestions[qIndex] = value;
        setCQs(newCQs);
    };

    const handleImageChange = (cqIndex, e) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].image = e.target.files[0];
        setCQs(newCQs);
    };

    const handleImageAlignmentChange = (cqIndex, value) => {
        const newCQs = [...cqs];
        newCQs[cqIndex].imageAlignment = value;
        setCQs(newCQs);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const binaryStr = event.target.result;
                const workbook = XLSX.read(binaryStr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                if (data.length > 0) {
                    const extractedQuestions = data.map(row => ({
                        passage: row.Passage || "",
                        classNumber: row.Class || selectedClass,
                        subject: row.Subject || selectedSubject,
                        chapterNumber: row["Chapter Number"] || selectedChapter,
                        chapterName: row["Chapter Name"] || selectedChapterName,
                        cqType: row["CQ Type"],
                        questions: row["CQ Type"] === "generalCQ"
                            ? [
                                row["Knowledge Question"] || "",
                                row["Comprehension Question"] || "",
                                row["Application Question"] || "",
                                row["Higher Skills Question"] || ""
                            ]
                            : [
                                row["Knowledge Question"] || "",
                                row["Application Question"] || "",
                                row["Higher Skills Question"] || ""
                            ],
                        imageAlignment: row["Image Alignment"] || "center", // Support for Excel
                    }));

                    const response = await fetch("/api/cq/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ questions: extractedQuestions })
                    });

                    if (response.ok) {
                        toast.success("প্রশ্ন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!");
                    } else {
                        toast.error("❌ ডাটাবেজে প্রশ্ন সংরক্ষণ ব্যর্থ হয়েছে!");
                    }
                } else {
                    toast.error("❌ এক্সেল ফাইল খালি বা ভুল ফরম্যাটে আছে!");
                }
            } catch (error) {
                toast.error("❌ ফাইল প্রসেসিংয়ে ত্রুটি!");
            }
        };
        reader.readAsBinaryString(file);
    };

    const resetForm = () => {
        setSelectedClass("");
        setSubjects([]);
        setSelectedSubject("");
        setChapters([]);
        setSelectedChapter("");
        setSelectedChapterName("");
        setSubjectParts([]);
        setSelectedSubjectPart("");
        setCQType("");
        setCQs([{ passage: "", questions: ["", "", "", ""], mathQuestions: ["", "", ""], image: null, imageAlignment: "center" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("classNumber", selectedClass);
        formData.append("subject", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart || "");
        formData.append("chapterNumber", selectedChapter);
        formData.append("chapterName", selectedChapterName);
        formData.append("teacherEmail", "admin");
        formData.append("cqType", cqType);

        cqs.forEach((cq, index) => {
            formData.append(`cqs[${index}][passage]`, cq.passage);
            formData.append(`cqs[${index}][questions]`, JSON.stringify(cqType === "generalCQ" ? cq.questions : cq.mathQuestions));
            if (cq.image) {
                formData.append(`cqs[${index}][image]`, cq.image);
            }
            formData.append(`cqs[${index}][imageAlignment]`, cq.imageAlignment);
        });

        try {
            const response = await fetch("/api/cq/import", {
                method: "POST",
                body: formData,
            });

            const responseData = await response.json();
            if (response.ok) {
                toast.success(`✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`, { position: "top-right" });
                resetForm();
            } else {
                toast.error(`❌ ${responseData.error || "কিছু সমস্যা হয়েছে!"}`, { position: "top-right" });
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("❌ সার্ভারের সাথে সংযোগে সমস্যা!", { position: "top-right" });
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">📝 সৃজনশীল প্রশ্ন তৈরি করুন</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Section */}
                <div
                    style={{
                        backgroundImage: "linear-gradient(to bottom right, #ffffff, #eaf4fc)",
                        padding: "20px",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 font-bold">এক্সেল ফাইল থেকে প্রশ্ন আমদানি করুন</label>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <p className="text-center">অথবা</p>
                        <hr className="mb-4" />

                        <select
                            className="w-full p-2 border rounded mb-3"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(Number(e.target.value))}
                            required
                        >
                            <option value="">ক্লাস নির্বাচন করুন</option>
                            {classes.map((cls) => (
                                <option key={cls.classNumber} value={cls.classNumber}>
                                    ক্লাস {cls.classNumber}
                                </option>
                            ))}
                        </select>

                        {selectedClass && subjects.length > 0 && (
                            <select
                                className="w-full p-2 border rounded mb-3"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                required
                            >
                                <option value="">বিষয় নির্বাচন করুন</option>
                                {subjects.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        )}

                        {selectedSubject && subjectParts.length > 0 && (
                            <select
                                className="w-full p-2 border rounded mb-3"
                                value={selectedSubjectPart}
                                onChange={(e) => setSelectedSubjectPart(e.target.value)}
                            >
                                <option value="">বিষয়ের অংশ (যদি থাকে)</option>
                                {subjectParts.map((part) => (
                                    <option key={part} value={part}>{part}</option>
                                ))}
                            </select>
                        )}

                        {selectedSubject && chapters.length > 0 && (
                            <select
                                className="w-full p-2 border rounded mb-3"
                                value={selectedChapter}
                                onChange={(e) => {
                                    const selected = chapters.find(chap => chap.number === parseInt(e.target.value));
                                    setSelectedChapter(e.target.value);
                                    setSelectedChapterName(selected?.name || "");
                                }}
                                required
                            >
                                <option value="">অধ্যায় নির্বাচন করুন</option>
                                {chapters.map((chapter) => (
                                    <option key={chapter.number} value={chapter.number}>{chapter.name}</option>
                                ))}
                            </select>
                        )}

                        <select
                            className="w-full p-2 border rounded mb-3"
                            value={cqType}
                            onChange={(e) => setCQType(e.target.value)}
                            required
                        >
                            <option value="">সৃজনশীল প্রশ্নের ধরণ নির্বাচন করুন</option>
                            <option value="generalCQ">সাধারণ সৃজনশীল প্রশ্ন</option>
                            <option value="mathCQ">গাণিতিক সৃজনশীল প্রশ্ন</option>
                        </select>

                        <div className="flex items-center mb-3">
                            <input
                                type="checkbox"
                                checked={isMultipleCQs}
                                onChange={(e) => setIsMultipleCQs(e.target.checked)}
                                className="mr-2"
                            />
                            <label>একাধিক সৃজনশীল প্রশ্ন যোগ করুন</label>
                        </div>

                        {cqs.map((cq, cqIndex) => (
                            <div key={cqIndex} className="mb-6 p-4 border rounded bg-gray-50">
                                <h3 className="text-lg font-semibold mb-2">সৃজনশীল প্রশ্ন {cqIndex + 1}</h3>
                                <textarea
                                    placeholder="🔹 অনুচ্ছেদ লিখুন"
                                    className="w-full p-3 border rounded mb-4 h-24"
                                    value={cq.passage}
                                    onChange={(e) => handlePassageChange(cqIndex, e.target.value)}
                                    required
                                />
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-bold">অনুচ্ছেদের সাথে ছবি যুক্ত করুন</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(cqIndex, e)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                {cq.image && (
                                    <div className="mb-4">
                                        <label className="block text-gray-700 mb-2 font-bold">ছবির অ্যালাইনমেন্ট</label>
                                        <select
                                            value={cq.imageAlignment}
                                            onChange={(e) => handleImageAlignmentChange(cqIndex, e.target.value)}
                                            className="w-full p-2 border rounded"
                                        >
                                            <option value="left">বামে</option>
                                            <option value="center">মাঝে</option>
                                            <option value="right">ডানে</option>
                                        </select>
                                    </div>
                                )}

                                {cqType === "generalCQ" && cq.questions.map((question, i) => (
                                    <div key={i} className="mb-4">
                                        <input
                                            type="text"
                                            placeholder={
                                                i === 0 ? "জ্ঞানমূলক প্রশ্ন" :
                                                i === 1 ? "অনুধাবনমূলক প্রশ্ন" :
                                                i === 2 ? "প্রয়োগ প্রশ্ন" :
                                                "উচ্চতর দক্ষতা"
                                            }
                                            className="w-full p-2 border rounded"
                                            value={question}
                                            onChange={(e) => handleQuestionChange(cqIndex, i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}

                                {cqType === "mathCQ" && cq.mathQuestions.map((question, i) => (
                                    <div key={i} className="mb-4">
                                        <input
                                            type="text"
                                            placeholder={
                                                i === 0 ? "জ্ঞানমূলক প্রশ্ন" :
                                                i === 1 ? "প্রয়োগ প্রশ্ন" :
                                                "উচ্চতর দক্ষতা"
                                            }
                                            className="w-full p-2 border rounded"
                                            value={question}
                                            onChange={(e) => handleMathQuestionChange(cqIndex, i, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}

                        {isMultipleCQs && (
                            <button
                                type="button"
                                onClick={addNewCQ}
                                className="w-full bg-green-500 text-white py-2 mt-3 rounded hover:bg-green-600 transition flex items-center justify-center"
                            >
                                <span className="text-xl mr-2">+</span> নতুন সৃজনশীল প্রশ্ন যোগ করুন
                            </button>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600"
                        >
                            ✅ সাবমিট করুন
                        </button>
                    </form>
                </div>

                {/* Preview Section */}
                <div
                    style={{
                        backgroundImage: "linear-gradient(to bottom right, #ffffff, #eaf4fc)",
                        padding: "20px",
                        borderRadius: "15px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h2 className="text-xl font-bold mb-4 text-blue-600">প্রিভিউ</h2>
                    {cqs.map((cq, cqIndex) => (
                        <div key={cqIndex} className="mb-6">
                            <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block mb-2">CQ</p>
                            <p className="text-lg font-semibold text-gray-900 mb-2">উদ্দীপক:</p>
                            <p className="text-gray-700 mb-4">{cq.passage || "অনুচ্ছেদ লিখুন"}</p>
                            {cq.image && (
                                <div className={`mb-4 ${cq.imageAlignment === "left" ? "text-left" : cq.imageAlignment === "right" ? "text-right" : "text-center"}`}>
                                    <img
                                        src={URL.createObjectURL(cq.image)}
                                        alt={`CQ preview ${cqIndex + 1}`}
                                        className="rounded shadow-md max-h-64 inline-block"
                                    />
                                </div>
                            )}
                            <div className="text-gray-900">
                                {(cqType === "generalCQ" ? cq.questions : cq.mathQuestions).map((ques, i) => (
                                    <p key={i} className="mb-2">
                                        {String.fromCharCode(2453 + i)}) {ques || "প্রশ্ন লিখুন"} {cqType === "generalCQ" ? `(${[1, 2, 3, 4][i]} নম্বর)` : `(${[2, 3, 4][i]} নম্বর)`}
                                    </p>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Class: {selectedClass || "N/A"} | Subject: {selectedSubject || "N/A"} | Chapter: {selectedChapterName || "N/A"} | Type: {cqType || "N/A"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}