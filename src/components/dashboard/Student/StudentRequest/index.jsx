"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter,
  FaChartBar,
  FaClock,
} from "react-icons/fa";

function StudentRequest() {
  const { data: session, status } = useSession();
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacherData, setSelectedTeacherData] = useState(null);
  const [requestStats, setRequestStats] = useState({
    totalPending: 0,
    sentToTeachers: 0,
    receivedFromTeachers: 0,
  });
  const [teacherRequests, setTeacherRequests] = useState([]);

  const categories = [
    "All",
    "Mathematics",
    "Physics",
    "Computer Science",
    "English",
  ];

  useEffect(() => {
    if (status === "authenticated") {
      fetchTeachers();
      fetchRequestStats();
      fetchTeacherRequests();
    }
  }, [status]);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredTeachers(teachers);
    } else {
      setFilteredTeachers(
        teachers.filter((teacher) => teacher.subject === selectedCategory)
      );
    }

    if (selectedTeacher) {
      const teacher = teachers.find((t) => t.username === selectedTeacher);
      setSelectedTeacherData(teacher);
    } else {
      setSelectedTeacherData(null);
    }
  }, [selectedCategory, selectedTeacher, teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/userManagement", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      const teacherData = data.filter((u) => u.userType === "Teacher");
      setTeachers(teacherData);
      setFilteredTeachers(teacherData);
      setLoading(false);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
      setLoading(false);
    }
  };

  const fetchRequestStats = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/studentRequest?studentId=${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch request stats");
      const { requests } = await response.json();

      // Since processed requests are deleted, stats will only reflect pending requests
      const stats = requests.reduce(
        (acc, req) => {
          acc.totalPending++;
          if (req.requestType === "studentToTeacher") {
            acc.sentToTeachers++;
          } else if (req.requestType === "teacherToStudent") {
            acc.receivedFromTeachers++;
          }
          return acc;
        },
        { totalPending: 0, sentToTeachers: 0, receivedFromTeachers: 0 }
      );

      setRequestStats(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTeacherRequests = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/studentRequest?studentId=${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch teacher requests");
      const { requests } = await response.json();
      setTeacherRequests(requests.filter((req) => req.requestType === "teacherToStudent"));
    } catch (error) {
      console.error("Error fetching teacher requests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) {
      setMessage("Please select a teacher before submitting.");
      setMessageType("error");
      return;
    }

    if (status !== "authenticated") {
      setMessage("Please log in to send a request");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const teacher = teachers.find((t) => t.username === selectedTeacher);
      const response = await fetch("/api/studentRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: session.user.id,
          teacherId: teacher._id,
          studentEmail: session.user.email,
          teacherEmail: teacher.email,
          message: `Request from ${session.user.name || session.user.email} to join ${teacher.username}'s course`,
          requestType: "studentToTeacher",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");

      setMessage(`Request sent to ${selectedTeacher} successfully!`);
      setMessageType("success");
      setSelectedTeacher("");
      await fetchRequestStats(); // Refresh stats after sending a request
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherRequestResponse = async (requestId, accept) => {
    try {
      const response = await fetch("/api/studentRequest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status: accept ? "approved" : "rejected",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update request");
      }

      // Refresh the teacher requests and stats to reflect the deletion
      await fetchTeacherRequests();
      await fetchRequestStats();
      setMessage(`Request ${accept ? "accepted" : "rejected"} successfully!`);
      setMessageType("success");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to send teacher requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10 transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full shadow-md">
                  <FaUserGraduate className="text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Find Your Teacher</h1>
                  <p className="opacity-90 mt-1 text-lg">
                    Welcome, {session.user.name || session.user.email}! Select a teacher to join their course.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <div className="bg-white/10 rounded-lg p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <FaChartBar className="mr-2 text-xl" />
                    <span className="font-semibold">Total Pending</span>
                  </div>
                  <span className="text-2xl font-bold">{requestStats.totalPending}</span>
                </div>
                <div className="bg-yellow-400/20 rounded-lg p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <FaClock className="mr-2 text-xl" />
                    <span className="font-semibold">Sent to Teachers</span>
                  </div>
                  <span className="text-2xl font-bold">{requestStats.sentToTeachers}</span>
                </div>
                <div className="bg-green-400/20 rounded-lg p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <FaCheckCircle className="mr-2 text-xl" />
                    <span className="font-semibold">From Teachers</span>
                  </div>
                  <span className="text-2xl font-bold">{requestStats.receivedFromTeachers}</span>
                </div>
              </div>
            </div>

            <div className="md:hidden grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-sm text-white/80 mb-1">Total Pending</div>
                <div className="text-xl font-bold">{requestStats.totalPending}</div>
              </div>
              <div className="bg-yellow-400/20 rounded-lg p-3 text-center">
                <div className="text-sm text-white/80 mb-1">Sent</div>
                <div className="text-xl font-bold">{requestStats.sentToTeachers}</div>
              </div>
              <div className="bg-green-400/20 rounded-lg p-3 text-center">
                <div className="text-sm text-white/80 mb-1">Received</div>
                <div className="text-xl font-bold">{requestStats.receivedFromTeachers}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Teacher Selection Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-lg">
                      Select a Teacher:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800 transition-all duration-300"
                      >
                        <option value="">-- Choose a Teacher --</option>
                        {filteredTeachers.map((teacher) => (
                          <option key={teacher._id} value={teacher.username}>
                            {teacher.username} - {teacher.subject || "General"}
                          </option>
                        ))}
                      </select>
                      <FaChalkboardTeacher className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedTeacher}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-6 w-6 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-3 text-xl" /> Send Request
                      </>
                    )}
                  </button>
                </form>

                {message && (
                  <div
                    className={`mt-6 p-4 rounded-xl flex items-center shadow-sm ${
                      messageType === "success"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    } animate-fade-in`}
                  >
                    {messageType === "success" ? (
                      <FaCheckCircle className="mr-3 text-green-600" />
                    ) : (
                      <FaExclamationCircle className="mr-3 text-red-600" />
                    )}
                    <span className="font-medium">{message}</span>
                  </div>
                )}
              </div>

              {/* Teacher Preview */}
              <div>
                {selectedTeacherData ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 transform transition-all duration-300 hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {selectedTeacherData.username.charAt(0)}
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                        {selectedTeacherData.subject || "General"}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedTeacherData.username}
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-1/3 font-semibold">Rating:</div>
                        <div className="font-medium text-yellow-600">
                          {selectedTeacherData.rating} / 5
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 font-semibold">Students:</div>
                        <div className="font-medium">120 students</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 font-semibold">Email:</div>
                        <div className="font-medium text-blue-600">
                          {selectedTeacherData.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100 shadow-inner">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Why choose {selectedTeacherData.username}?
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {selectedTeacherData.username} is an experienced educator with a passion
                        for teaching {selectedTeacherData.subject || "various subjects"}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center h-full text-center transition-all duration-300">
                    <FaChalkboardTeacher className="text-5xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      No Teacher Selected
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Select a teacher from the dropdown to see their details
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Requests Section */}
            {teacherRequests.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requests from Teachers</h2>
                <div className="space-y-4">
                  {teacherRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {req.teacherEmail} wants you to join their circle
                        </p>
                        <p className="text-sm text-gray-600">{req.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTeacherRequestResponse(req._id, true)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleTeacherRequestResponse(req._id, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:shadow-lg"
              }`}
            >
              {category === "All" ? <FaFilter className="inline mr-2" /> : null}
              {category}
            </button>
          ))}
        </div>

        {/* Teacher Cards */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Teachers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer ${
                  selectedTeacher === teacher.username ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedTeacher(teacher.username)}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-3"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {teacher.username.charAt(0)}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {teacher.subject || "General"}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{teacher.username}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    Rating: <span className="text-yellow-600 font-medium">{teacher.rating}</span> • 120 students
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentRequest;