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
    const [questions, setQuestions] = useState(["", "", "", ""]);
    const [mathQuestions, setMathQuestions] = useState(["", "", ""]);
    const [passage, setPassage] = useState("");
    const [image, setImage] = useState(null);

    useEffect(() => {
        async function fetchClasses() {
            const res = await fetch("/api/cq");
            const data = await res.json();
            setClasses(data);
        }
        fetchClasses();
    }, []);

    useEffect(() => {
        async function fetchClassData() {
            if (!selectedClass) return;
            const res = await fetch(`/api/cq?classNumber=${selectedClass}`);
            const data = await res.json();

            if (data.length > 0) {
                setSubjects([...new Set(data.map((item) => item.subject))]);
                setSubjectParts([...new Set(data.map((item) => item.subjectPart))]);
                setChapters([...new Set(data.map((item) => ({ number: item.chapterNumber, name: item.chapterName })))]);
            }
        }
        fetchClassData();
    }, [selectedClass]);

    // Handle file change (Excel file upload)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = async (event) => {
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
                    cqType: row["CQ Type"], // Determines whether it's generalCQ or mathCQ
    
                    // Handling different CQ types
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
                }));
    
                // Send data to API
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
        };
    
        reader.readAsBinaryString(file);
    };
     const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index] = value;
        setQuestions(newQuestions);
    };

    const handleMathQuestionChange = (index, value) => {
        const newMathQuestions = [...mathQuestions];
        newMathQuestions[index] = value;
        setMathQuestions(newMathQuestions);
    };
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
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
        setPassage("");
        setQuestions(["", "", "", ""]);
        setMathQuestions(["", "", ""]);
        setCQType("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create a FormData object for handling text and image data
        const formData = new FormData();

        // Append text data to the FormData object
        formData.append("passage", passage);
        formData.append("questions", JSON.stringify(cqType === "generalCQ" ? questions : mathQuestions));
        formData.append("classNumber", selectedClass);
        formData.append("division", null); // if applicable
        formData.append("subject", selectedSubject);
        formData.append("subjectPart", selectedSubjectPart);
        formData.append("chapterNumber", selectedChapter);
        formData.append("chapterName", selectedChapterName);
        formData.append("teacherEmail", "admin");
        formData.append("cqType", cqType);

        // Append image data to the FormData object
        if (image) {
            formData.append("image", image); // Ensure "image" is your file input's state
        }

        // Debugging FormData (Optional)
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        // Make the API request
        const response = await fetch("/api/cq", {
            method: "POST",
            body: formData, // FormData handles the multipart/form-data format
        });

        // Handle the response
        if (response.ok) {
            toast.success("সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!", { position: "top-right" });
            resetForm();
        } else {
            const error = await response.json();
            console.error("❌ Submission Error:", error);
            toast.error(`❌ কিছু সমস্যা হয়েছে! ${error.error}`, { position: "top-right" });
        }
    };

    return (
        <div
            style={{
                backgroundImage: "linear-gradient(to bottom right, #ffffff, #eaf4fc)",
                padding: "20px",
                borderRadius: "15px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                maxWidth: "600px",
                margin: "30px auto",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h2
                style={{
                    textAlign: "center",
                    color: "#007BFF",
                    marginBottom: "20px",
                    fontWeight: "bold",
                }}
            >
                📝 সৃজনশীল প্রশ্ন তৈরি করুন
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="block text-gray-700 mb-2"
                        style={{ fontWeight: "bold" }}
                    >
                        এক্সেল ফাইল থেকে প্রশ্ন আমদানি করুন
                    </label>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="w-full p-2 border rounded"
                    />
                </div>
                <p>অথবা</p>
                <hr />
                <br />
                <select className="w-full p-2 border rounded mb-3" value={selectedClass} onChange={(e) => setSelectedClass(Number(e.target.value))} required > <option value="">ক্লাস নির্বাচন করুন</option> {classes.map((cls) => (<option key={cls.classNumber} value={cls.classNumber}> ক্লাস {cls.classNumber} </option>))} </select> {selectedClass && subjects.length > 0 && (<select className="w-full p-2 border rounded mb-3" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required> <option value="">বিষয় নির্বাচন করুন</option> {subjects.map((subject) => (<option key={subject} value={subject}>{subject}</option>))} </select>)} {selectedSubject && subjectParts.length > 0 && (<select className="w-full p-2 border rounded mb-3" value={selectedSubjectPart} onChange={(e) => setSelectedSubjectPart(e.target.value)}> <option value="">বিষয়ের অংশ (যদি থাকে)</option> {subjectParts.map((part) => (<option key={part} value={part}>{part}</option>))} </select>)} {selectedSubject && chapters.length > 0 && (<select className="w-full p-2 border rounded mb-3" value={selectedChapter} onChange={(e) => { const selected = chapters.find(chap => chap.number === parseInt(e.target.value)); setSelectedChapter(e.target.value); setSelectedChapterName(selected?.name || ""); }} required> <option value="">অধ্যায় নির্বাচন করুন</option> {chapters.map((chapter) => (<option key={chapter.number} value={chapter.number}>{chapter.name}</option>))} </select>)}
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

                <textarea
                    placeholder="🔹 অনুচ্ছেদ লিখুন"
                    className="w-full p-3 border rounded mb-4 h-24"
                    value={passage}
                    onChange={(e) => setPassage(e.target.value)}
                />
                <div className="mb-4">
                    <label
                        className="block text-gray-700 mb-2"
                        style={{ fontWeight: "bold" }}
                    >
                        অনুচ্ছেদের সাথে ছবি যুক্ত করুন
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {cqType === "generalCQ" &&
                    questions.map((question, i) => (
                        <div key={i} className="mb-4">
                            <input
                                type="text"
                                placeholder={
                                    i === 0
                                        ? "জ্ঞানমূলক প্রশ্ন"
                                        : i === 1
                                            ? "অনুধাবনমূলক প্রশ্ন"
                                            : i === 2
                                                ? "প্রয়োগ প্রশ্ন"
                                                : "উচ্চতর দক্ষতা"
                                }
                                className="w-full p-2 border rounded"
                                value={question}
                                onChange={(e) => handleQuestionChange(i, e.target.value)}
                                required
                            />
                        </div>
                    ))}

                {cqType === "mathCQ" &&
                    mathQuestions.map((question, i) => (
                        <div key={i} className="mb-4">
                            <input
                                type="text"
                                placeholder={
                                    i === 0
                                        ? "জ্ঞানমূলক প্রশ্ন"
                                        : i === 1
                                            ? "প্রয়োগ প্রশ্ন"
                                            : "উচ্চতর দক্ষতা"
                                }
                                className="w-full p-2 border rounded"
                                value={question}
                                onChange={(e) => handleMathQuestionChange(i, e.target.value)}
                                required
                            />
                        </div>
                    ))}

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 mt-3 rounded hover:bg-blue-600"
                >
                    ✅ সাবমিট করুন
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
}
