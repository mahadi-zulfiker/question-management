"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaChalkboardTeacher, FaPaperPlane, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

function TeacherRequests() {
  const { data: session, status } = useSession();
  const [studentRequests, setStudentRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCircle, setSelectedCircle] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.userType === "Teacher") {
      fetchAllData();
    }
  }, [status, session]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchStudentRequests(),
        fetchStudents(),
        fetchCircles(),
      ]);
      setLoading(false);
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
      setMessageType("error");
      setLoading(false);
    }
  };

  const fetchStudentRequests = async () => {
    if (!session?.user?.id) return;
    console.log("Fetching requests for teacherId:", session.user.id);
    const response = await fetch(`/api/studentRequest?teacherId=${session.user.id}`);
    if (!response.ok) throw new Error("Failed to fetch student requests");
    const data = await response.json();
    console.log("API Response:", data);
    const requests = data.requests || [];
    setStudentRequests(requests.filter((req) => req.requestType === "studentToTeacher" || !req.requestType));
  };

  const fetchStudents = async () => {
    const response = await fetch("/api/createCircle");
    if (!response.ok) throw new Error("Failed to fetch students");
    const data = await response.json();
    setStudents(data);
  };

  const fetchCircles = async () => {
    const response = await fetch("/api/viewCircle");
    if (!response.ok) throw new Error("Failed to fetch circles");
    const data = await response.json();
    setCircles(data);
  };

  const handleStudentRequestResponse = async (requestId, accept, circleId) => {
    try {
      const response = await fetch("/api/studentRequest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status: accept ? "approved" : "rejected",
          circleId: accept ? circleId : undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update request");
      }

      // Refresh the requests to reflect the deletion
      await fetchStudentRequests();
      await fetchCircles(); // Refresh circles to reflect the updated student list
      setMessage(`Request ${accept ? "approved" : "rejected"} successfully!`);
      setMessageType("success");
    } catch (error) {
      console.error("Error in handleStudentRequestResponse:", error);
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    }
  };

  const sendTeacherRequest = async () => {
    if (!selectedStudent || !selectedCircle) {
      setMessage("Please select a student and a circle");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const student = students.find((s) => s._id === selectedStudent);
      const circle = circles.find((c) => c._id === selectedCircle);
      const response = await fetch("/api/studentRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent,
          teacherId: session.user.id,
          studentEmail: student.email,
          teacherEmail: session.user.email,
          message: `Request from ${session.user.name || session.user.email} to join ${circle.circleName}`,
          requestType: "teacherToStudent",
        }),
      });

      if (!response.ok) throw new Error("Failed to send request");
      setMessage("Request sent successfully!");
      setMessageType("success");
      setSelectedStudent("");
      setSelectedCircle("");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.userType !== "Teacher") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be a teacher to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-full shadow-md">
                <FaChalkboardTeacher className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Requests</h1>
                <p className="opacity-90 mt-1 text-lg">
                  Welcome, {session.user.name || session.user.email}! Handle student requests and invite students.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Student Requests */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Requests</h2>
              {studentRequests.length > 0 ? (
                <div className="space-y-4">
                  {studentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-gray-50 p-4 rounded-xl shadow-md flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {req.studentEmail} wants to join your course
                        </p>
                        <p className="text-sm text-gray-600">{req.message}</p>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="p-2 border rounded-lg"
                          onChange={(e) => handleStudentRequestResponse(req._id, true, e.target.value)}
                        >
                          <option value="">Add to Circle</option>
                          {circles.map((circle) => (
                            <option key={circle._id} value={circle._id}>
                              {circle.circleName}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStudentRequestResponse(req._id, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No pending student requests.</p>
              )}
            </div>

            {/* Send Request to Student */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite a Student</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full p-4 bg-gray-50 border rounded-xl"
                  >
                    <option value="">Select a Student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.username} ({student.email})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCircle}
                    onChange={(e) => setSelectedCircle(e.target.value)}
                    className="w-full p-4 bg-gray-50 border rounded-xl"
                  >
                    <option value="">Select a Circle</option>
                    {circles.map((circle) => (
                      <option key={circle._id} value={circle._id}>
                        {circle.circleName}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={sendTeacherRequest}
                  disabled={loading || !selectedStudent || !selectedCircle}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {loading ? "Processing..." : (
                    <>
                      <FaPaperPlane className="mr-3" /> Send Invite
                    </>
                  )}
                </button>
              </div>
            </div>

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
        </div>
      </div>
    </div>
  );
}

export default TeacherRequests;