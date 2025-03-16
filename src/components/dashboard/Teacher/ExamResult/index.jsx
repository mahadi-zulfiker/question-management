"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExamResult = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");
  const [examIdFilter, setExamIdFilter] = useState("");
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [markingSubmission, setMarkingSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [collectionFilter, examIdFilter, userEmailFilter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (collectionFilter) params.append("collection", collectionFilter);
      if (examIdFilter) params.append("examId", examIdFilter);
      if (userEmailFilter) params.append("userEmail", userEmailFilter);

      const response = await fetch(`/api/examResult?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();

      setSubmissions(data.submissions || []);
    } catch (error) {
      toast.error(`Failed to load submissions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSubmission = async (submission, scores) => {
    setLoading(true);
    try {
      const response = await fetch("/api/examResult", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission._id.toString(),
          collection: submission.collection,
          scores,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmissions(
          submissions.map((sub) =>
            sub._id.toString() === submission._id.toString()
              ? {
                  ...sub,
                  scores: data.submission.scores,
                  achievedMarks: Object.values(data.submission.scores).reduce((a, b) => a + b, 0),
                }
              : sub
          )
        );
        toast.success("Marks updated successfully!");
        setMarkingSubmission(null);
      } else {
        toast.error(data.message || "Failed to update marks.");
      }
    } catch (error) {
      toast.error(`Failed to update marks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-indigo-800 drop-shadow-md">
          Exam Result Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Effortlessly review and mark student submissions with an intuitive interface.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-8 transform transition-all hover:shadow-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type:</label>
              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white"
              >
                <option value="">All Types of Exams</option>
                <option value="ExamSubmissions">Admission Exams</option>
                <option value="ModelTestSubmissions">Model Tests</option>
                <option value="submissions">Regular Exams</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam ID:</label>
              <input
                type="text"
                value={examIdFilter}
                onChange={(e) => setExamIdFilter(e.target.value)}
                placeholder="Enter Exam ID..."
                className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Email:</label>
              <input
                type="text"
                value={userEmailFilter}
                onChange={(e) => setUserEmailFilter(e.target.value)}
                placeholder="Enter User Email..."
                className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-800">Student Submissions</h2>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-6 py-4 text-left text-gray-700 font-semibold">Student Name</th>
                    <th className="border px-6 py-4 text-left text-gray-700 font-semibold">Total Number</th>
                    <th className="border px-6 py-4 text-left text-gray-700 font-semibold">Achieved Number</th>
                    <th className="border px-6 py-4 text-left text-gray-700 font-semibold">Submit</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="border px-6 py-4 text-gray-800">{submission.userEmail}</td>
                      <td className="border px-6 py-4 text-gray-600">{submission.totalMarks}</td>
                      <td className="border px-6 py-4 text-gray-600">{submission.achievedMarks || 0}</td>
                      <td className="border px-6 py-4">
                        <button
                          onClick={() => setMarkingSubmission(submission)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                          disabled={loading}
                        >
                          Edit/Change
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {markingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-indigo-800">Mark Submission: {markingSubmission.userEmail}</h3>
            <div className="space-y-6">
              {Object.entries(markingSubmission.normalizedAnswers || {}).length > 0 ? (
                Object.entries(markingSubmission.normalizedAnswers).map(([key, value]) => {
                  const maxMarks = value.marks || 1;
                  const currentScore = markingSubmission.scores?.[key] || 0;
                  return (
                    <div
                      key={key}
                      className="border-l-4 border-indigo-500 p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
                    >
                      <p className="text-gray-700 font-medium">
                        <strong>Question:</strong> {value.question}
                      </p>
                      <p className="text-gray-600">
                        <strong>Answer:</strong> {value.answer}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">
                          Score (0-{maxMarks})
                        </label>
                        <input
                          type="number"
                          name={`${key}Score`}
                          defaultValue={currentScore}
                          min="0"
                          max={maxMarks}
                          className="w-24 p-2 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No answers available for this submission.</p>
              )}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setMarkingSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const scores = {};
                    Object.keys(markingSubmission.normalizedAnswers || {}).forEach((key) => {
                      const scoreInput = document.querySelector(`input[name="${key}Score"]`);
                      if (scoreInput && scoreInput.value) scores[key] = Number(scoreInput.value);
                    });
                    if (Object.keys(scores).length === 0) {
                      toast.error("Please provide at least one score.");
                      return;
                    }
                    handleMarkSubmission(markingSubmission, scores);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                  disabled={loading}
                >
                  <CheckCircle size={18} />
                  {loading ? "Saving..." : "Submit Marks"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;