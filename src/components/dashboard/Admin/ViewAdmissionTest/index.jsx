"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

export default function ViewAdmissionTest() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState(null);
  const [editedData, setEditedData] = useState({});

  // Fetch all tests
  useEffect(() => {
    async function fetchTests() {
      try {
        const response = await fetch("/api/viewAdmissionTests");
        const data = await response.json();
        if (response.ok) {
          setTests(data.tests || []);
        } else {
          toast.error(`❌ Failed to load tests: ${data.error || "Unknown error"}`);
        }
      } catch (error) {
        toast.error("❌ Error fetching tests!");
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

  // Handle edit button click
  const handleEdit = (test) => {
    setEditingTest(test._id);
    setEditedData({ ...test });
  };

  // Handle input changes in edit modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "classNumber" || name === "chapterNumber" ? parseInt(value) : value,
    }));
  };

  // Save edited test
  const handleSave = async () => {
    try {
      const response = await fetch("/api/viewAdmissionTests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTest, ...editedData }),
      });
      const result = await response.json();
      if (response.ok) {
        setTests((prev) =>
          prev.map((test) => (test._id === editingTest ? { ...test, ...editedData } : test))
        );
        setEditingTest(null);
        toast.success("✅ Test updated successfully!");
      } else {
        toast.error(`❌ Failed to update test: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("❌ Error updating test!");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      const response = await fetch("/api/viewAdmissionTests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok) {
        setTests((prev) => prev.filter((test) => test._id !== id));
        toast.success("✅ Test deleted successfully!");
      } else {
        toast.error(`❌ Failed to delete test: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("❌ Error deleting test!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard - View Admission Tests
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Manage your admission tests: edit or delete as needed.
          </p>
        </motion.div>
      </div>

      {/* Tests List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, index) => (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                  <h2 className="text-xl font-semibold truncate">{test.title}</h2>
                  <p className="text-sm opacity-80">{test.type}</p>
                </div>
                <div className="p-6 space-y-3 text-gray-700">
                  <p><span className="font-medium">Class:</span> {test.classNumber}</p>
                  <p><span className="font-medium">Subject:</span> {test.subject}</p>
                  <p><span className="font-medium">Chapter:</span> {test.chapterNumber}</p>
                  <p><span className="font-medium">Duration:</span> {test.duration} min</p>
                  <p><span className="font-medium">Questions:</span> {test.questions.length}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(test)}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 transition-all duration-200"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-all duration-200"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-600 text-lg bg-white p-6 rounded-xl shadow-md"
          >
            No admission tests found.
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
          >
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Edit Test</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={editedData.title || ""}
                onChange={handleInputChange}
                placeholder="Test Title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="type"
                value={editedData.type || ""}
                onChange={handleInputChange}
                placeholder="Test Type (e.g., MCQ)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="duration"
                value={editedData.duration || ""}
                onChange={handleInputChange}
                placeholder="Duration (minutes)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="classNumber"
                value={editedData.classNumber || ""}
                onChange={handleInputChange}
                placeholder="Class Number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                name="subject"
                value={editedData.subject || ""}
                onChange={handleInputChange}
                placeholder="Subject"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                name="chapterNumber"
                value={editedData.chapterNumber || ""}
                onChange={handleInputChange}
                placeholder="Chapter Number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTest(null)}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-full border border-gray-300 transition-all duration-200"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all duration-200"
              >
                <FaSave />
                <span>Save</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}