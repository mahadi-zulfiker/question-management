"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MarksHistory() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchMarksHistory(session.user.email);
    }
  }, [status, session]);

  const fetchMarksHistory = async (userEmail) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marksHistory?userEmail=${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error("Failed to fetch marks history");
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      toast.error(`Failed to load marks history: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <p className="text-2xl text-indigo-600 animate-pulse">Loading your marks history...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Please log in to view your marks history.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-4 drop-shadow-md">
          📊 Your Marks History
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Welcome, {session.user.email}! Here’s a detailed overview of your exam results.
        </p>
      </div>

      {/* Results Section */}
      <div className="max-w-5xl mx-auto">
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">No results found yet.</p>
            <p className="text-gray-500 mt-2">Complete an exam to see your marks here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div
                key={result._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-indigo-800">{result.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      result.totalMarks / result.maxMarks >= 0.7
                        ? "bg-green-100 text-green-700"
                        : result.totalMarks / result.maxMarks >= 0.5
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {result.totalMarks}/{result.maxMarks} (
                    {((result.totalMarks / result.maxMarks) * 100).toFixed(1)}%)
                  </span>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Exam ID:</strong> {result.examId}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Evaluated On:</strong>{" "}
                  {new Date(result.evaluatedAt).toLocaleString()}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Updated On:</strong> {new Date(result.updatedAt).toLocaleString()}
                </p>

                {/* Details Section */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Question Details</h3>
                  <div className="space-y-4">
                    {Object.entries(result.details || {}).map(([questionId, detail]) => (
                      <div
                        key={questionId}
                        className="border-l-4 border-indigo-400 pl-4 py-2 bg-gray-50 rounded-r-lg"
                      >
                        <p className="text-gray-700">
                          <strong>Answer:</strong> {detail.answer || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <strong>Score:</strong> {detail.score}/{1}{" "}
                          <span
                            className={`text-sm ${
                              detail.score > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            ({detail.score > 0 ? "Correct" : "Incorrect"})
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarksHistory;