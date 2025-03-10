"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

export default function ViewQuestionBank() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/viewQuestionBanks");
      const data = await response.json();
      if (response.ok) {
        setQuestionBanks(data);
      } else {
        toast.error(`❌ Failed to fetch question banks: ${data.error}`);
      }
    } catch (error) {
      console.error("Error fetching question banks:", error);
      toast.error("❌ Error fetching question banks!");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bank) => {
    setEditingId(bank._id);
    setEditedData({
      name: bank.name,
      validity: bank.validity ? new Date(bank.validity).toISOString().split("T")[0] : "",
      description: bank.description || "",
      price: bank.price || "",
      classNumber: bank.class?.classNumber || "",
      subject: bank.class?.subject || "",
      chapterNumber: bank.class?.chapterNumber || "",
      chapterName: bank.class?.chapterName || "",
      questions: JSON.stringify(bank.questions || [], null, 2), // Pretty print JSON
      status: bank.status || "active",
    });
  };

  const handleSave = async (id) => {
    try {
      const questions = JSON.parse(editedData.questions || "[]");
      const response = await fetch("/api/viewQuestionBanks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editedData.name,
          validity: editedData.validity,
          description: editedData.description,
          price: parseFloat(editedData.price),
          class: {
            classNumber: parseInt(editedData.classNumber),
            subject: editedData.subject,
            chapterNumber: parseInt(editedData.chapterNumber),
            chapterName: editedData.chapterName,
          },
          questions,
          status: editedData.status,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Question bank updated successfully!");
        setQuestionBanks((prev) =>
          prev.map((bank) =>
            bank._id === id
              ? {
                  ...bank,
                  name: editedData.name,
                  validity: new Date(editedData.validity).toISOString(),
                  description: editedData.description,
                  price: parseFloat(editedData.price),
                  class: {
                    classNumber: parseInt(editedData.classNumber),
                    subject: editedData.subject,
                    chapterNumber: parseInt(editedData.chapterNumber),
                    chapterName: editedData.chapterName,
                  },
                  questions,
                  status: editedData.status,
                }
              : bank
          )
        );
        setEditingId(null);
        setEditedData({});
      } else {
        toast.error(`❌ Failed to update: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating question bank:", error);
      toast.error("❌ Error updating question bank! Check JSON format.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question bank?")) return;

    try {
      const response = await fetch("/api/viewQuestionBanks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("✅ Question bank deleted successfully!");
        setQuestionBanks((prev) => prev.filter((bank) => bank._id !== id));
      } else {
        toast.error(`❌ Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting question bank:", error);
      toast.error("❌ Error deleting question bank!");
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
          <h1 className="text-3xl font-bold text-teal-700 mb-4">
            View Question Banks Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your question banks: view, edit, or delete them with ease.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-12 w-12 text-teal-600"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {questionBanks.length > 0 ? (
              questionBanks.map((bank) => (
                <motion.div
                  key={bank._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 border border-gray-200"
                >
                  {editingId === bank._id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        name="name"
                        value={editedData.name || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Name"
                      />
                      <input
                        type="date"
                        name="validity"
                        value={editedData.validity || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        name="description"
                        value={editedData.description || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        name="price"
                        value={editedData.price || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Price"
                      />
                      <input
                        type="number"
                        name="classNumber"
                        value={editedData.classNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Class Number"
                      />
                      <input
                        type="text"
                        name="subject"
                        value={editedData.subject || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Subject"
                      />
                      <input
                        type="number"
                        name="chapterNumber"
                        value={editedData.chapterNumber || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Chapter Number"
                      />
                      <input
                        type="text"
                        name="chapterName"
                        value={editedData.chapterName || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Chapter Name"
                      />
                      <textarea
                        name="questions"
                        value={editedData.questions || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        rows="4"
                        placeholder='Questions as JSON (e.g., [{"question": "What is velocity?", "options": ["Speed", "Distance"], "correctAnswer": 0}])'
                      />
                      <select
                        name="status"
                        value={editedData.status || "active"}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSave(bank._id)}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-all"
                        >
                          <FaSave />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          <FaTimes />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-teal-600">{bank.name}</h2>
                      <p className="text-gray-700">
                        <span className="font-medium">Validity:</span>{" "}
                        {new Date(bank.validity).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Description:</span>{" "}
                        {bank.description}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Price:</span> ${bank.price}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Class:</span> {bank.class?.classNumber || "-"}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Subject:</span> {bank.class?.subject || "-"}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Chapter:</span>{" "}
                        {bank.class?.chapterNumber} - {bank.class?.chapterName || "-"}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Questions:</span>{" "}
                        {bank.questions.length}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Status:</span> {bank.status}
                      </p>
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleEdit(bank)}
                          className="flex items-center space-x-1 bg-teal-600 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition-all mr-2"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(bank._id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all"
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
                No question banks found.
              </p>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}