"use client";
import React, { useState, useEffect } from "react";
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
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teachers, setTeachers] = useState([
    {
      _id: "67b9e4a77b598a329d956c95",
      username: "amitav roy",
      email: "teacher@gmail.com",
      userType: "Teacher",
      rating: 4.9,
      updatedAt: "2025-03-09T17:41:24.523Z",
    },
  ]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setloading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacherData, setSelectedTeacherData] = useState(null);

  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const categories = [
    "All",
    "Mathematics",
    "Physics",
    "Computer Science",
    "English",
  ];

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
  }, [selectedTeacher, teachers]);

  useEffect(() => {
    fetchUsers();
  }, [teachers]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/userManagement", {
        cache: "no-store",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      // Ensure each user has a unique _id
      const usersWithUniqueId = data.map((user, index) => ({
        ...user,
        _id: user._id || `${user.email}_${index}`,
      }));
      const onlyTeachers = usersWithUniqueId.filter(
        (u) => u.userType === "Teacher"
      );
      setTeachers(onlyTeachers);
      setUsers(usersWithUniqueId);
      setloading(false);
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch users: ${err.message}`,
      });
      setloading(false);
    }
  };

  //TO-DO the request need to send to the database
  //  const sendRequest = async (teacherId) => {
  //    setLoading(true);

  //    // Simulate API call
  //    setTimeout(() => {
  //      // Update pending requests
  //      setPendingRequests((prev) => ({
  //        ...prev,
  //        [teacherId]: "pending",
  //      }));

  //      // Update request stats
  //      setRequestStats((prev) => ({
  //        ...prev,
  //        total: prev.total + 1,
  //        pending: prev.pending + 1,
  //      }));

  //      setMessage(`Request sent successfully!`);
  //      setMessageType("success");
  //      setLoading(false);
  //    }, 1000);
  //  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("users", users);
    setloading(true);

    if (selectedTeacher) {
      // Simulate API call
      setTimeout(() => {
        setMessage(`Request sent to ${selectedTeacher} successfully!`);
        setMessageType("success");
        setloading(false);
      }, 1000);
    } else {
      setMessage("Please select a teacher before submitting.");
      setMessageType("error");
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <FaUserGraduate className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Find Your Teacher</h1>
                  <p className="opacity-90 mt-1">
                    Select a teacher and send a request to join their course
                  </p>
                </div>
              </div>

              {/* Request Statistics */}
              <div className="hidden md:flex space-x-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaChartBar className="mr-1" />
                    <span className="font-semibold">Total</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {requestStats.total}
                  </span>
                </div>
                <div className="bg-yellow-400/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaClock className="mr-1" />
                    <span className="font-semibold">Pending</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {requestStats.pending}
                  </span>
                </div>
                <div className="bg-green-400/20 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaCheckCircle className="mr-1" />
                    <span className="font-semibold">Approved</span>
                  </div>
                  <span className="text-2xl font-bold">
                    {requestStats.approved}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden grid grid-cols-3 gap-2 p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Total</div>
              <div className="text-lg font-bold text-blue-600">
                {requestStats.total}
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Pending</div>
              <div className="text-lg font-bold text-yellow-600">
                {requestStats.pending}
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 text-center shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Approved</div>
              <div className="text-lg font-bold text-green-600">
                {requestStats.approved}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Teacher Selection Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-lg">
                      Select a Teacher:
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                      >
                        <option value="">-- Choose a Teacher --</option>
                        {filteredTeachers.map((teacher) => (
                          <option key={teacher._id} value={teacher.username}>
                            {teacher.username} - {teacher.subject}
                          </option>
                        ))}
                      </select>
                      <FaChalkboardTeacher className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedTeacher}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-105 ${
                      loading || !selectedTeacher
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" /> Send Request
                      </>
                    )}
                  </button>
                </form>

                {/* Message */}
                {message && (
                  <div
                    className={`mt-6 p-4 rounded-lg flex items-center ${
                      messageType === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    } animate-fadeIn`}
                  >
                    {messageType === "success" ? (
                      <FaCheckCircle className="mr-2 text-green-500" />
                    ) : (
                      <FaExclamationCircle className="mr-2 text-red-500" />
                    )}
                    {message}
                  </div>
                )}
              </div>

              {/* Teacher Preview */}
              <div>
                {selectedTeacherData ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 transform transition-all duration-300 hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {selectedTeacherData.username.charAt(0)}
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {selectedTeacherData.subject || "General"}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedTeacherData.username}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-1/3 text-gray-600 font-medium">
                          Rating:
                        </div>
                        <div className="flex items-center">
                          <div className="text-yellow-500 flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${
                                  i < Math.floor(selectedTeacherData.rating)
                                    ? "fill-current"
                                    : "fill-current opacity-30"
                                }`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 font-semibold">
                            {selectedTeacherData.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 text-gray-600 font-medium">
                          Students:
                        </div>
                        <div className="font-semibold">120 students</div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-1/3 text-gray-600 font-medium">
                          Email:
                        </div>
                        <div className="font-semibold text-blue-600">
                          {selectedTeacherData.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Why choose {selectedTeacherData.username}?
                      </h4>
                      <p className="text-gray-600">
                        {selectedTeacherData.username} is an experienced
                        educator with a passion for teaching{" "}
                        {selectedTeacherData.subject || "various subjects"}.
                        Join 120+ students who have already benefited from their
                        expertise.
                      </p>
                    </div>

                    {/* Request Status TO-DO */}
                    {/* {pendingRequests[selectedTeacherData._id] && (
                      <div
                        className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                          pendingRequests[selectedTeacherData._id] ===
                          "approved"
                            ? "bg-green-100 text-green-700"
                            : pendingRequests[selectedTeacherData._id] ===
                              "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        Request status:{" "}
                        {pendingRequests[selectedTeacherData._id]
                          .charAt(0)
                          .toUpperCase() +
                          pendingRequests[selectedTeacherData._id].slice(1)}
                      </div>
                    )} */}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center h-full text-center">
                    <FaChalkboardTeacher className="text-5xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      No Teacher Selected
                    </h3>
                    <p className="text-gray-400">
                      Select a teacher from the dropdown to see their details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category === "All" ? <FaFilter className="inline mr-1" /> : null}
              {category}
            </button>
          ))}
        </div>

        {/* Teacher Cards */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Available Teachers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer ${
                  selectedTeacher === teacher.username
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedTeacher(teacher.username)}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-3"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {teacher.username.charAt(0)}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {teacher.subject}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800">
                    {teacher.username}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="text-yellow-500 flex mr-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${
                            i < Math.floor(teacher.rating)
                              ? "fill-current"
                              : "fill-current opacity-30"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {teacher.rating}
                      {/* •{teacher.students}  */}. 120 students
                    </span>
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
