// components/GuardianForm.jsx
"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash2, User, Mail, Phone, Search } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const StudentGurdian = () => {
  const [guardians, setGuardians] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch guardians on mount
  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/studentGurdian");
      if (!response.ok) throw new Error("Failed to fetch guardians");
      const data = await response.json();
      setGuardians(data.guardians || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Failed to load guardians: ${error.message}`,
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic form validation
    if (!formData.fullName || !formData.relationship || !formData.phone) {
      toast.error("Please fill in all required fields (Full Name, Relationship, Phone Number).", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/studentGurdian", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingId }),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingId) {
          // Update the specific guardian instantly
          setGuardians(guardians.map((g) => (g.id === editingId ? data.guardian : g)));
          toast.success("Guardian updated successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // Add the new guardian instantly and reset form
          setGuardians([...guardians, data.guardian]);
          toast.success("Guardian added successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
          resetForm();
        }
      } else {
        toast.error(data.message || "Something went wrong", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(`Failed to process request: ${error.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guardian) => {
    setFormData(guardian);
    setEditingId(guardian.id);
  };

  const handleDelete = async (id) => {
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
        const response = await fetch("/api/studentGurdian", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          setGuardians(guardians.filter((g) => g.id !== id));
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Guardian has been deleted.",
            confirmButtonColor: "#3085d6",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete guardian",
            confirmButtonColor: "#d33",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to delete guardian: ${error.message}`,
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
      occupation: "",
    });
    setEditingId(null);
  };

  // Filter guardians based on search query
  const filteredGuardians = guardians.filter((guardian) =>
    guardian.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guardian.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guardian.relationship.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 animate-gradient">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-700">
          Student Guardian Hub
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
          Seamlessly manage your guardians with a modern and intuitive interface. Add, edit, or remove guardians effortlessly.
        </p>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-10 transform transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-3xl font-bold mb-8 flex items-center text-indigo-800">
            <User className="mr-4" /> {editingId ? "Edit Guardian" : "Add New Guardian"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                required
                disabled={loading}
                placeholder="Enter full name"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                required
                disabled={loading}
              >
                <option value="">Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Guardian">Guardian</option>
                <option value="Sibling">Sibling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                  required
                  disabled={loading}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                  disabled={loading}
                  placeholder="Enter email (optional)"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                rows="4"
                disabled={loading}
                placeholder="Enter address (optional)"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 p-3"
                disabled={loading}
                placeholder="Enter occupation (optional)"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-6 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : editingId ? "Update Guardian" : "Add Guardian"}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Guardians List */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <Search className="mr-2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, or relationship..."
              className="w-full p-3 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
            />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-indigo-800">Guardians List</h2>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading guardians...</p>
            </div>
          ) : filteredGuardians.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No guardians found.</p>
              <p className="text-gray-400 mt-2">Add a guardian or adjust your search!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredGuardians.map((guardian) => (
                <div
                  key={guardian.id}
                  className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-800">{guardian.fullName}</h3>
                      <p className="text-gray-600">{guardian.relationship}</p>
                      <p className="text-gray-600 flex items-center">
                        <Phone size={16} className="mr-2 text-indigo-500" />
                        {guardian.phone}
                      </p>
                      {guardian.email && (
                        <p className="text-gray-600 flex items-center">
                          <Mail size={16} className="mr-2 text-indigo-500" />
                          {guardian.email}
                        </p>
                      )}
                      {guardian.address && (
                        <p className="text-gray-600 text-sm">{guardian.address}</p>
                      )}
                      {guardian.occupation && (
                        <p className="text-gray-600 text-sm italic">Occupation: {guardian.occupation}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(guardian)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(guardian.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGurdian;