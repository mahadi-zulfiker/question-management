"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash2, CheckCircle, XCircle, Search } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const ExamResult = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState("");
  const [examIdFilter, setExamIdFilter] = useState("");
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [markingSubmission, setMarkingSubmission] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);

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
      console.log("Fetched submissions:", data.submissions);

      const normalizedSubmissions = (data.submissions || []).map((sub) => ({
        ...sub,
        collection: sub.collection,
      }));

      setSubmissions(normalizedSubmissions);
      setFilteredSubmissions(normalizedSubmissions);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(`Failed to load submissions: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSubmission = async (submission, scores) => {
    setLoading(true);
    try {
      console.log("Sending mark data:", {
        id: submission._id.toString(),
        collection: submission.collection,
        scores,
      });

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
              ? { ...sub, scores: data.submission.scores }
              : sub
          )
        );
        setFilteredSubmissions(
          filteredSubmissions.map((sub) =>
            sub._id.toString() === submission._id.toString()
              ? { ...sub, scores: data.submission.scores }
              : sub
          )
        );
        toast.success("Marks updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setMarkingSubmission(null);
      } else {
        console.error("Marking failed:", data);
        // Fallback: Refetch submissions in case the update succeeded but response failed
        await fetchSubmissions();
        toast.error(data.message || "Failed to update marks, but changes may have been applied. Refreshed data.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Mark error:", error);
      // Fallback: Refetch submissions in case of network error
      await fetchSubmissions();
      toast.error(`Failed to update marks: ${error.message}. Refreshed data.`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmission = async (submission, updatedAnswers) => {
    setLoading(true);
    try {
      const response = await fetch("/api/examResult", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submission._id.toString(),
          collection: submission.collection,
          answers: updatedAnswers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissions(
          submissions.map((sub) =>
            sub._id.toString() === submission._id.toString()
              ? { ...sub, answers: data.submission.answers }
              : sub
          )
        );
        setFilteredSubmissions(
          filteredSubmissions.map((sub) =>
            sub._id.toString() === submission._id.toString()
              ? { ...sub, answers: data.submission.answers }
              : sub
          )
        );
        toast.success("Submission updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setEditingSubmission(null);
      } else {
        await fetchSubmissions();
        toast.error(data.message || "Failed to update submission, but changes may have been applied. Refreshed data.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      await fetchSubmissions();
      toast.error(`Failed to update submission: ${error.message}. Refreshed data.`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submission) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await fetch("/api/examResult", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: submission._id.toString(), collection: submission.collection }),
        });

        if (response.ok) {
          setSubmissions(submissions.filter((sub) => sub._id.toString() !== submission._id.toString()));
          setFilteredSubmissions(
            filteredSubmissions.filter((sub) => sub._id.toString() !== submission._id.toString())
          );
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Submission has been deleted.",
            confirmButtonColor: "#3086d6",
          });
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorData.message || "Failed to delete submission",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to delete submission: ${error.message}`,
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 animate-gradient">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
          Exam Result Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
          Manage and mark student submissions for admission exams, model tests, and regular exams.
        </p>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
              <select
                value={collectionFilter}
                onChange={(e) => setCollectionFilter(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
              >
                <option value="">All Collections</option>
                <option value="ExamSubmissions">Admission Exams</option>
                <option value="ModelTestSubmissions">Model Tests</option>
                <option value="submissions">Regular Exams</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam ID</label>
              <input
                type="text"
                value={examIdFilter}
                onChange={(e) => setExamIdFilter(e.target.value)}
                placeholder="Filter by exam ID..."
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
              />
            </div>
            <div className="flex items-center">
              <Search className="mr-2 text-gray-400" size={20} />
              <input
                type="text"
                value={userEmailFilter}
                onChange={(e) => setUserEmailFilter(e.target.value)}
                placeholder="Search by user email..."
                className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-800">Student Submissions</h2>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No submissions found.</p>
              <p className="text-gray-400 mt-2">Adjust your filters to see submissions!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSubmissions.map((submission) => {
                const normalizedAnswers = Object.entries(submission.answers || {}).reduce(
                  (acc, [key, value]) => {
                    if (typeof value === "object" && value !== null) {
                      if (value.type && value.answer) {
                        acc[key] = {
                          question: value.type || `Question ${key}`,
                          answer: value.answer,
                        };
                      } else {
                        const subQuestions = Object.entries(value).map(([subKey, subValue]) => ({
                          question: subKey,
                          answer: subValue,
                        }));
                        subQuestions.forEach((item, index) => {
                          acc[`${key}_${index}`] = item;
                        });
                      }
                    } else {
                      acc[key] = { question: `Question ${key}`, answer: value };
                    }
                    return acc;
                  },
                  {}
                );

                return (
                  <div
                    key={submission._id}
                    className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {submission.userEmail || "Unknown User"}
                      </h3>
                      <p className="text-gray-600">Collection: {submission.collection}</p>
                      <p className="text-gray-600">
                        Submitted At: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                      <p className="text-gray-600">Exam ID: {submission.examId || submission.testId || "N/A"}</p>

                      {Object.keys(normalizedAnswers).length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700">Questions & Answers:</h4>
                          {Object.entries(normalizedAnswers).map(([key, { question, answer }]) => (
                            <div key={key} className="mb-2">
                              <p className="text-gray-600">
                                <strong>Question:</strong> {question}
                              </p>
                              <p className="text-gray-600">
                                <strong>Answer:</strong> {answer || "N/A"}
                              </p>
                              <p className="text-gray-600">
                                <strong>Score:</strong> {submission.scores?.[key.split("_")[0]] || "Not marked"}
                                {submission.scores?.[key.split("_")[0]] ? (
                                  <CheckCircle className="inline ml-2 text-green-500" size={16} />
                                ) : (
                                  <XCircle className="inline ml-2 text-red-500" size={16} />
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <button
                        onClick={() =>
                          setMarkingSubmission({ ...submission, normalizedAnswers: submission.answers })
                        }
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        Mark
                      </button>
                      <button
                        onClick={() =>
                          setEditingSubmission({ ...submission, normalizedAnswers: submission.answers })
                        }
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteSubmission(submission)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Marking Modal */}
      {markingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Mark Submission: {markingSubmission.userEmail || "Unknown User"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const scores = {};
                Object.keys(markingSubmission.normalizedAnswers || {}).forEach((key) => {
                  const scoreInput = e.target[`${key}Score`];
                  if (scoreInput) {
                    const score = scoreInput.value;
                    if (score) {
                      scores[key.split("_")[0]] = Number(score);
                    }
                  }
                });
                if (Object.keys(scores).length === 0) {
                  toast.error("Please provide at least one score.", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                  return;
                }
                handleMarkSubmission(markingSubmission, scores);
              }}
            >
              <div className="space-y-4">
                {Object.entries(markingSubmission.normalizedAnswers || {}).map(([key, value]) => {
                  const { question, answer } = typeof value === "object" ? value : { question: key, answer: value };
                  return (
                    <div key={key} className="border-b pb-4">
                      <p className="text-gray-700">
                        <strong>Question:</strong> {question || `Question ${key}`}
                      </p>
                      <p className="text-gray-600">
                        <strong>Answer:</strong> {answer || "N/A"}
                      </p>
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Score for {question || `Question ${key}`} (0-100)
                      </label>
                      <input
                        type="number"
                        name={`${key}Score`}
                        defaultValue={markingSubmission.scores?.[key.split("_")[0]] || ""}
                        min="0"
                        max="100"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 mt-1"
                        placeholder="Enter score"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setMarkingSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Marks"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Edit Submission: {editingSubmission.userEmail || "Unknown User"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedAnswers = {};
                Object.entries(editingSubmission.normalizedAnswers || {}).forEach(([key, value]) => {
                  const answerInput = e.target[`${key}Answers`];
                  if (answerInput) {
                    const answers = answerInput.value.split(",").map((ans) => ans.trim());
                    if (answers.length > 0) {
                      updatedAnswers[key.split("_")[0]] = answers;
                    }
                  }
                });
                if (Object.keys(updatedAnswers).length === 0) {
                  toast.error("Please provide at least one answer.", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                  return;
                }
                handleEditSubmission(editingSubmission, updatedAnswers);
              }}
            >
              <div className="space-y-4">
                {Object.entries(editingSubmission.normalizedAnswers || {}).map(([key, value]) => {
                  const { question, answer } = typeof value === "object" ? value : { question: key, answer: value };
                  return (
                    <div key={key} className="border-b pb-4">
                      <p className="text-gray-700">
                        <strong>Question:</strong> {question || `Question ${key}`}
                      </p>
                      <p className="text-gray-600">
                        <strong>Current Answer:</strong> {answer || "N/A"}
                      </p>
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        New Answers for {question || `Question ${key}`} (comma-separated)
                      </label>
                      <input
                        type="text"
                        name={`${key}Answers`}
                        defaultValue={
                          typeof answer === "string" ? answer : answer?.join(", ") || ""
                        }
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 p-3 mt-1"
                        placeholder="Enter new answers"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;