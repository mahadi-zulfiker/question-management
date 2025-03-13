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

      const normalizedSubmissions = (data.submissions || []).map((sub) => ({
        ...sub,
        collection: sub.collection,
      }));

      setSubmissions(normalizedSubmissions);
      setFilteredSubmissions(normalizedSubmissions);
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
        toast.success("Marks updated and stored successfully!");
        setMarkingSubmission(null);
      } else {
        await fetchSubmissions();
        toast.error(data.message || "Failed to update marks, data refreshed.");
      }
    } catch (error) {
      await fetchSubmissions();
      toast.error(`Failed to update marks: ${error.message}. Data refreshed.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submission) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will also delete the associated results!",
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
            text: "Submission and results deleted.",
          });
        } else {
          const errorData = await response.json();
          Swal.fire({ icon: "error", title: "Error", text: errorData.message || "Failed to delete" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error", text: `Failed to delete: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-indigo-700">Exam Result Dashboard</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
          Review and mark student submissions efficiently.
        </p>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All Collections</option>
              <option value="ExamSubmissions">Admission Exams</option>
              <option value="ModelTestSubmissions">Model Tests</option>
              <option value="submissions">Regular Exams</option>
            </select>
            <input
              type="text"
              value={examIdFilter}
              onChange={(e) => setExamIdFilter(e.target.value)}
              placeholder="Filter by Exam ID..."
              className="p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
            <div className="flex items-center">
              <Search className="mr-2 text-gray-400" size={20} />
              <input
                type="text"
                value={userEmailFilter}
                onChange={(e) => setUserEmailFilter(e.target.value)}
                placeholder="Search by user email..."
                className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-indigo-800">Student Submissions</h2>
          {loading ? (
            <p className="text-center text-gray-600 py-10">Loading submissions...</p>
          ) : filteredSubmissions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No submissions found.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="border rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-semibold text-gray-800">{submission.userEmail}</h3>
                  <p className="text-gray-600">Collection: {submission.collection}</p>
                  <p className="text-gray-600">
                    Submitted: {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                  <p className="text-gray-600">Exam ID: {submission.examId || "N/A"}</p>
                  {submission.scores && (
                    <p className="text-gray-600">
                      Total Marks: {Object.values(submission.scores).reduce((a, b) => a + b, 0)}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4 justify-end">
                    <button
                      onClick={() => setMarkingSubmission({ ...submission, normalizedAnswers: submission.answers })}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      disabled={loading}
                    >
                      Mark
                    </button>
                    <button
                      onClick={() => handleDeleteSubmission(submission)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      disabled={loading}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {markingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Mark Submission: {markingSubmission.userEmail}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const scores = {};
                Object.keys(markingSubmission.normalizedAnswers || {}).forEach((key) => {
                  const scoreInput = e.target[`${key}Score`];
                  if (scoreInput && scoreInput.value) scores[key.split("_")[0]] = Number(scoreInput.value);
                });
                if (Object.keys(scores).length === 0) {
                  toast.error("Please provide at least one score.");
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
                      <p className="text-gray-700"><strong>Question:</strong> {question}</p>
                      <p className="text-gray-600"><strong>Answer:</strong> {answer || "N/A"}</p>
                      <label className="block text-sm font-medium text-gray-700 mt-2">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        name={`${key}Score`}
                        defaultValue={markingSubmission.scores?.[key.split("_")[0]] || ""}
                        min="0"
                        max="100"
                        className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setMarkingSubmission(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Marks"}
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