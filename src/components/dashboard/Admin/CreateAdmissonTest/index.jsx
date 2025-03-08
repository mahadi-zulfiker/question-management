"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateAdmissionTest() {
  const [testTitle, setTestTitle] = useState("");
  const [testType, setTestType] = useState("");
  const [duration, setDuration] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch("/api/admissionTest/classes");
        const data = await response.json();
        if (response.ok) setClasses(data.classes || []);
        else toast.error("❌ Failed to load classes!");
      } catch (error) {
        toast.error("❌ Error fetching classes!");
      }
    }
    fetchClasses();
  }, []);

  // Fetch subjects when classNumber changes
  useEffect(() => {
    if (!classNumber) {
      setSubjects([]);
      setChapters([]);
      setQuestions([]);
      return;
    }
    async function fetchSubjects() {
      try {
        const response = await fetch(`/api/admissionTest/classes?classNumber=${classNumber}`);
        const data = await response.json();
        if (response.ok) {
          const uniqueSubjects = [...new Set(data.classes.map(c => c.subject))];
          setSubjects(uniqueSubjects);
        } else toast.error("❌ Failed to load subjects!");
      } catch (error) {
        toast.error("❌ Error fetching subjects!");
      }
    }
    fetchSubjects();
  }, [classNumber]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!classNumber || !subject) {
      setChapters([]);
      setQuestions([]);
      return;
    }
    async function fetchChapters() {
      try {
        const response = await fetch(`/api/admissionTest/classes?classNumber=${classNumber}&subject=${subject}`);
        const data = await response.json();
        if (response.ok) {
          const uniqueChapters = [...new Set(data.classes.map(c => c.chapterNumber))];
          setChapters(uniqueChapters);
        } else toast.error("❌ Failed to load chapters!");
      } catch (error) {
        toast.error("❌ Error fetching chapters!");
      }
    }
    fetchChapters();
  }, [classNumber, subject]);

  // Fetch questions when filters are fully set
  useEffect(() => {
    if (!testType || !classNumber || !subject || !chapterNumber) {
      setQuestions([]);
      setFilteredQuestions([]);
      setSelectedQuestions([]);
      return;
    }
    async function fetchQuestions() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admissionTest/questions?type=${testType}&classNumber=${classNumber}&subject=${subject}&chapterNumber=${chapterNumber}`
        );
        const data = await response.json();
        if (response.ok) {
          const fetchedQuestions = Array.isArray(data.questions) ? data.questions : [];
          setQuestions(fetchedQuestions);
          setFilteredQuestions(fetchedQuestions);
        } else {
          toast.error(`❌ No questions found for ${testType} in Class ${classNumber}, ${subject}, Chapter ${chapterNumber}!`);
        }
      } catch (error) {
        toast.error("❌ Error fetching questions!");
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [testType, classNumber, subject, chapterNumber]);

  // Filter questions based on search query
  useEffect(() => {
    const filtered = questions.filter(q => {
      if (!q) return false;
      const query = searchQuery.toLowerCase();
      if (testType === "MCQ") return q.question?.toLowerCase().includes(query);
      if (testType === "CQ") return q.passage?.toLowerCase().includes(query);
      if (testType === "SQ") return q.passage?.toLowerCase().includes(query) || q.questions?.some(qs => qs.toLowerCase().includes(query));
      return false;
    });
    setFilteredQuestions(filtered);
  }, [searchQuery, questions, testType]);

  const handleSelect = (question) => {
    setSelectedQuestions(prev =>
      prev.some(q => q._id === question._id)
        ? prev.filter(q => q._id !== question._id)
        : [...prev, question]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testTitle.trim()) return toast.error("❌ Test title is required!");
    if (!testType) return toast.error("❌ Test type is required!");
    if (!duration || duration <= 0) return toast.error("❌ Duration must be positive!");
    if (!classNumber) return toast.error("❌ Class is required!");
    if (!subject) return toast.error("❌ Subject is required!");
    if (!chapterNumber) return toast.error("❌ Chapter is required!");
    if (selectedQuestions.length === 0) return toast.error("❌ Select at least one question!");

    const testData = {
      title: testTitle,
      type: testType,
      duration: parseInt(duration),
      classNumber: parseInt(classNumber),
      subject,
      chapterNumber: parseInt(chapterNumber),
      questions: selectedQuestions,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/admissionTest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        toast.success("✅ Admission test created successfully!");
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(`❌ Failed to create test: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("❌ Submission error!");
    }
  };

  const resetForm = () => {
    setTestTitle("");
    setTestType("");
    setDuration("");
    setClassNumber("");
    setSubject("");
    setChapterNumber("");
    setQuestions([]);
    setFilteredQuestions([]);
    setSelectedQuestions([]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Create Admission Test
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Build an admission test by selecting questions from your database.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input
                  type="text"
                  placeholder="Enter test title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g., 60"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls.classNumber}>
                      Class {cls.classNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={!classNumber}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  value={chapterNumber}
                  onChange={(e) => setChapterNumber(e.target.value)}
                  required
                  disabled={!subject}
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(chap => (
                    <option key={chap} value={chap}>Chapter {chap}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                required
              >
                <option value="">Select Test Type</option>
                <option value="MCQ">Multiple Choice (MCQ)</option>
                <option value="CQ">Creative Questions (CQ)</option>
                <option value="SQ">Short Questions (SQ)</option>
              </select>
            </div>
            {testType && classNumber && subject && chapterNumber && (
              <div className="mt-8 bg-gray-50 p-6 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Select Questions</h3>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-3 sm:mt-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredQuestions.map(q => (
                      <div key={q._id} className="border border-gray-200 p-4 rounded-lg bg-white">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            onChange={() => handleSelect(q)}
                            checked={selectedQuestions.some(sel => sel._id === q._id)}
                            className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            {testType === "MCQ" && (
                              <>
                                <p className="font-medium text-gray-900">{q.question}</p>
                                <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
                                  {q.options?.map((opt, idx) => <li key={idx}>{opt}</li>)}
                                </ul>
                              </>
                            )}
                            {testType === "CQ" && (
                              <>
                                <p className="font-medium text-gray-900">{q.passage}</p>
                                <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
                                  {q.questions?.map((cq, idx) => <li key={idx}>{cq}</li>)}
                                </ul>
                              </>
                            )}
                            {testType === "SQ" && (
                              <>
                                <p className="font-medium text-gray-900">{q.passage}</p>
                                <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
                                  {q.questions?.map((sq, idx) => <li key={idx}>{sq}</li>)}
                                </ul>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600 text-center py-6">❌ No questions found.</p>
                )}
              </div>
            )}
            {selectedQuestions.length > 0 && (
              <div className="mt-8 bg-green-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Selected Questions ({selectedQuestions.length})</h3>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {selectedQuestions.map(q => (
                    <div key={q._id} className="border border-green-200 p-4 rounded-lg bg-white flex justify-between">
                      <div>
                        {testType === "MCQ" && <p className="font-medium text-gray-900">{q.question}</p>}
                        {testType === "CQ" && <p className="font-medium text-gray-900">{q.passage}</p>}
                        {testType === "SQ" && <p className="font-medium text-gray-900">{q.passage}</p>}
                      </div>
                      <button onClick={() => handleSelect(q)} className="text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading}
              >
                Create Test
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}