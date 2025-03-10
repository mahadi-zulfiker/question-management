"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ViewModelTest() {
  const [modelTests, setModelTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchModelTests();
  }, []);

  const fetchModelTests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/viewModelTests");
      const data = await response.json();
      if (response.ok) {
        setModelTests(data);
      } else {
        toast.error(`❌ Failed to fetch model tests: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching model tests:", error);
      toast.error("❌ Error fetching model tests!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test) => {
    setEditingId(test._id);
    setEditedData({
      name: test.name,
      duration: test.duration,
      classNumber: test.class?.classNumber || "",
      subject: test.class?.subject || "",
      chapterNumber: test.class?.chapterNumber || "",
      chapterName: test.class?.chapterName || "",
      status: test.status,
    });
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch("/api/viewModelTests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editedData.name,
          duration: editedData.duration,
          class: {
            classNumber: parseInt(editedData.classNumber),
            subject: editedData.subject,
            chapterNumber: parseInt(editedData.chapterNumber),
            chapterName: editedData.chapterName,
          },
          status: editedData.status,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Model test updated successfully!");
        setModelTests((prev) =>
          prev.map((test) =>
            test._id === id
              ? {
                  ...test,
                  name: editedData.name,
                  duration: editedData.duration,
                  class: {
                    classNumber: parseInt(editedData.classNumber),
                    subject: editedData.subject,
                    chapterNumber: parseInt(editedData.chapterNumber),
                    chapterName: editedData.chapterName,
                  },
                  status: editedData.status,
                }
              : test
          )
        );
        setEditingId(null);
        setEditedData({});
      } else {
        toast.error(`❌ Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating model test:", error);
      toast.error("❌ Error updating model test!");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this model test?")) return;

    try {
      const response = await fetch("/api/viewModelTests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Model test deleted successfully!");
        setModelTests((prev) => prev.filter((test) => test._id !== id));
      } else {
        toast.error(`❌ Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting model test:", error);
      toast.error("❌ Error deleting model test!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-indigo-700 mb-4">
            View Model Tests Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your model tests: view, edit, or delete them efficiently.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelTests.length > 0 ? (
              modelTests.map((test) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  {editingId === test._id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="name"
                        value={editedData.name || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Test Name"
                      />
                      <input
                        type="number"
                        name="duration"
                        value={editedData.duration || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Duration (minutes)"
                      />
                      <input
                        type="number"
                        name="classNumber"
                        value={editedData.classNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Class Number"
                      />
                      <input
                        type="text"
                        name="subject"
                        value={editedData.subject || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Subject"
                      />
                      <input
                        type="number"
                        name="chapterNumber"
                        value={editedData.chapterNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Chapter Number"
                      />
                      <input
                        type="text"
                        name="chapterName"
                        value={editedData.chapterName || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Chapter Name"
                      />
                      <select
                        name="status"
                        value={editedData.status || "active"}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSave(test._id)}
                          className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
                        >
                          <FaSave />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center space-x-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold text-indigo-600 mb-2">
                        {test.name}
                      </h2>
                      <p className="text-gray-700">
                        <span className="font-medium">Duration:</span> {test.duration} min
                      </p>
                      {test.class && (
                        <>
                          <p className="text-gray-700">
                            <span className="font-medium">Class:</span> {test.class.classNumber}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Subject:</span> {test.class.subject}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Chapter:</span> {test.class.chapterNumber} - {test.class.chapterName}
                          </p>
                        </>
                      )}
                      <p className="text-gray-700">
                        <span className="font-medium">Questions:</span> {test.questions.length}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Status:</span> {test.status}
                      </p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button
                          onClick={() => handleEdit(test)}
                          className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(test._id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No model tests found.
              </p>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}