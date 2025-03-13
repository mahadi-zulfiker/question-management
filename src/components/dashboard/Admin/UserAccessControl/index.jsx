"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Lock, Unlock, Edit, CheckCircle, DollarSign, X } from "lucide-react";

function UserAccessControl() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [subjectsPartsChapters, setSubjectsPartsChapters] = useState({});
  const [accessForm, setAccessForm] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchSubjectsPartsChapters();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/userAccessControl");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsPartsChapters = async () => {
    try {
      const response = await fetch("/api/userAccessControl?action=fetchSubjectsPartsChapters");
      if (!response.ok) throw new Error("Failed to fetch subjects, parts, and chapters");
      const data = await response.json();
      console.log("Fetched subjectsPartsChapters:", data.subjectsPartsChapters); // Debug log
      setSubjectsPartsChapters(data.subjectsPartsChapters || {});
    } catch (error) {
      toast.error(`Failed to load resource data: ${error.message}`);
    }
  };

  const handleAccessChange = (collection, field, value) => {
    setAccessForm((prev) => ({
      ...prev,
      [collection]: {
        ...prev[collection],
        [field]: value,
      },
    }));
  };

  const applySuggestedAccess = () => {
    if (!editingUser) return;
    setAccessForm(editingUser.suggestedAccess || {});
    toast.info("Suggested access applied!");
  };

  const handleSaveAccess = async () => {
    if (!editingUser) return;
    setLoading(true);
    try {
      const response = await fetch("/api/userAccessControl", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser._id.toString(), // Ensure userId is a string
          access: accessForm,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update access");
      toast.success("User access updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to update access: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAccessModal = (user) => {
    setEditingUser(user);
    const initialAccess = {};
    const collections = ["questionBanks", "SQ", "cqs", "mcqs"];
    collections.forEach((collection) => {
      initialAccess[collection] = user.access?.[collection] || {
        subjects: [],
        parts: [],
        chapters: [],
      };
    });
    setAccessForm(initialAccess);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-100 to-purple-200 p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-4 drop-shadow-md animate-fade-in">
          🔐 User Access Control Dashboard
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto animate-slide-up">
          Seamlessly manage user access to educational resources based on their payments and usage.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-xl text-indigo-600 animate-pulse">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">No users found.</p>
            <p className="text-gray-500 mt-2">Add users to manage their access.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-indigo-800 truncate">{user.email}</h2>
                  <button
                    onClick={() => openAccessModal(user)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                    title="Edit Access"
                  >
                    <Edit size={20} />
                  </button>
                </div>
                <div className="flex items-center mb-2 text-gray-600">
                  <DollarSign size={18} className="mr-2 text-green-600" />
                  <p>
                    <strong>Total Paid:</strong> ${user.totalPaid || 0}
                  </p>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Transactions:</strong> {user.transactionCount || 0}
                </p>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Access</h3>
                  {Object.keys(user.access || {}).length === 0 ? (
                    <p className="text-gray-500 flex items-center">
                      <Lock size={16} className="mr-2 text-red-500" /> No access granted
                    </p>
                  ) : (
                    Object.entries(user.access).map(([collection, access]) => (
                      <div key={collection} className="mb-2">
                        <p className="text-gray-700 font-medium flex items-center">
                          <Unlock size={16} className="mr-2 text-green-500" /> {collection}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Subjects:</strong>{" "}
                          {access.subjects?.length > 0 ? access.subjects.join(", ") : "None"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Parts:</strong>{" "}
                          {access.parts?.length > 0 ? access.parts.join(", ") : "None"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <strong>Chapters:</strong>{" "}
                          {access.chapters?.length > 0 ? access.chapters.join(", ") : "None"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              title="Close"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-indigo-800">
              Manage Access for {editingUser.email}
            </h3>
            <div className="flex items-center mb-6">
              <DollarSign size={20} className="mr-2 text-green-600" />
              <p className="text-gray-600">
                Total Paid: ${editingUser.totalPaid || 0} | Transactions: {editingUser.transactionCount || 0}
              </p>
            </div>
            <button
              onClick={applySuggestedAccess}
              className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center"
            >
              <CheckCircle size={18} className="mr-2" /> Apply Suggested Access
            </button>

            <div className="space-y-8">
              {Object.entries(subjectsPartsChapters).map(([collection, data]) => (
                <div key={collection} className="border-b pb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">{collection}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
                      <select
                        multiple
                        value={accessForm[collection]?.subjects || []}
                        onChange={(e) =>
                          handleAccessChange(
                            collection,
                            "subjects",
                            Array.from(e.target.selectedOptions, (option) => option.value)
                          )
                        }
                        className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all bg-white shadow-sm"
                        size={data.subjects.length || 1}
                      >
                        {data.subjects.length > 0 ? (
                          data.subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))
                        ) : (
                          <option disabled>No subjects available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parts</label>
                      <select
                        multiple
                        value={accessForm[collection]?.parts || []}
                        onChange={(e) =>
                          handleAccessChange(
                            collection,
                            "parts",
                            Array.from(e.target.selectedOptions, (option) => option.value)
                          )
                        }
                        className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all bg-white shadow-sm"
                        size={data.parts.length || 1}
                      >
                        {data.parts.length > 0 ? (
                          data.parts.map((part) => (
                            <option key={part} value={part}>
                              {part}
                            </option>
                          ))
                        ) : (
                          <option disabled>No parts available</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chapters</label>
                      <select
                        multiple
                        value={accessForm[collection]?.chapters || []}
                        onChange={(e) =>
                          handleAccessChange(
                            collection,
                            "chapters",
                            Array.from(e.target.selectedOptions, (option) => option.value)
                          )
                        }
                        className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition-all bg-white shadow-sm"
                        size={data.chapters.length || 1}
                      >
                        {data.chapters.length > 0 ? (
                          data.chapters.map((chapter) => (
                            <option key={chapter} value={chapter}>
                              {chapter}
                            </option>
                          ))
                        ) : (
                          <option disabled>No chapters available</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccess}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                ) : (
                  <CheckCircle size={18} className="mr-2" />
                )}
                {loading ? "Saving..." : "Save Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAccessControl;