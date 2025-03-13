"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

function AttendedExams() {
  const { data: session, status } = useSession();
  const [attendedExams, setAttendedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchAttendedExams();
    }
  }, [status, session]);

  const fetchAttendedExams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Normalize email to lowercase to match the API
      const normalizedEmail = session.user.email.toLowerCase();
      console.log("Fetching exams for email:", normalizedEmail);

      const response = await fetch(
        `/api/attendedExams?userEmail=${normalizedEmail}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch attended exams");
      }

      console.log("API Response:", data);
      setAttendedExams(data.attendedExams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine exam status based on results
  const getExamStatus = (results) => {
    if (!results || results.every((result) => result === null)) {
      return { text: "Pending Evaluation", color: "bg-yellow-100 text-yellow-800" };
    }
    return { text: "Evaluated", color: "bg-green-100 text-green-800" };
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to view your attended exams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all duration-300 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full shadow-md">
                <FaClipboardList className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Attended Exams</h1>
                <p className="opacity-90 mt-1 text-lg">
                  Welcome, {session.user.name || session.user.email}! View the exams you’ve attended.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-center bg-red-100 text-red-800 border border-red-200 animate-fade-in">
                <FaExclamationCircle className="mr-3 text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {attendedExams.length === 0 ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                <FaClipboardList className="text-5xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  No Exams Attended
                </h3>
                <p className="text-gray-400 text-sm">
                  You haven’t attended any exams yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendedExams.map((exam) => {
                  const status = getExamStatus(exam.results);
                  return (
                    <div
                      key={exam._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2"></div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                          {exam.examDetails.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {exam.examDetails.description}
                        </p>
                        <div className="space-y-2 text-sm text-gray-700">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-blue-500" />
                            <span>
                              Submitted on: {formatDate(exam.submittedAt)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">Subject:</span>
                            <span>{exam.examDetails.subject}</span>
                          </div>
                        </div>
                        <div className="mt-4 text-gray-500 text-sm">
                          Duration: {exam.examDetails.duration} mins
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendedExams;