import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DollarSign,
  Save,
  RefreshCw,
  BookOpen,
  FileText,
  User,
  Users,
} from "lucide-react";

function PriceSetQuestion() {
  const [prices, setPrices] = useState({
    teacherMCQ: 0,
    teacherCQ: 0,
    teacherSQ: 0,
    teacherModelTest: 0,
    teacherAdmissionTest: 0,
    studentMCQ: 0,
    studentCQ: 0,
    studentSQ: 0,
    studentModelTest: 0,
    studentAdmissionTest: 0,
  });
  const [formData, setFormData] = useState({
    teacherMCQ: "",
    teacherCQ: "",
    teacherSQ: "",
    teacherModelTest: "",
    teacherAdmissionTest: "",
    studentMCQ: "",
    studentCQ: "",
    studentSQ: "",
    studentModelTest: "",
    studentAdmissionTest: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch current prices on component mount
  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/priceSetQuestions");
      const data = await response.json();
      if (data.prices) {
        setPrices(data.prices);
        setFormData({
          teacherMCQ: data.prices.teacherMCQ || "",
          teacherCQ: data.prices.teacherCQ || "",
          teacherSQ: data.prices.teacherSQ || "",
          teacherModelTest: data.prices.teacherModelTest || "",
          teacherAdmissionTest: data.prices.teacherAdmissionTest || "",
          studentMCQ: data.prices.studentMCQ || "",
          studentCQ: data.prices.studentCQ || "",
          studentSQ: data.prices.studentSQ || "",
          studentModelTest: data.prices.studentModelTest || "",
          studentAdmissionTest: data.prices.studentAdmissionTest || "",
        });
        toast.success("Prices loaded successfully!", { position: "top-right" });
      } else {
        toast.warn("No prices found, set new prices.", { position: "top-right" });
      }
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch prices", { position: "top-right" });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/priceSetQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.message === "Prices updated successfully") {
        setPrices({ ...formData });
        toast.success("Prices updated successfully!", { position: "top-right" });
      } else {
        toast.error("Failed to update prices", { position: "top-right" });
      }
    } catch (err) {
      toast.error("Error updating prices", { position: "top-right" });
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    fetchPrices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
            <DollarSign className="mr-2 text-blue-600" /> Price Set Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <p className="text-gray-600 mb-8 text-center">
          Set and manage pricing for MCQ, CQ, SQ, Model Tests, and Admission Tests in Taka (TK).
        </p>

        {/* Current Prices Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
            <BookOpen className="mr-2 text-blue-600" /> Current Prices (TK)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <User className="mr-2 text-blue-600" /> For Teachers
              </h3>
              <p className="text-gray-600">MCQ: ৳{prices.teacherMCQ}</p>
              <p className="text-gray-600">CQ: ৳{prices.teacherCQ}</p>
              <p className="text-gray-600">SQ: ৳{prices.teacherSQ}</p>
              <p className="text-gray-600">Model Test: ৳{prices.teacherModelTest}</p>
              <p className="text-gray-600">Admission Test: ৳{prices.teacherAdmissionTest}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
                <Users className="mr-2 text-green-600" /> For Students
              </h3>
              <p className="text-gray-600">MCQ: ৳{prices.studentMCQ}</p>
              <p className="text-gray-600">CQ: ৳{prices.studentCQ}</p>
              <p className="text-gray-600">SQ: ৳{prices.studentSQ}</p>
              <p className="text-gray-600">Model Test: ৳{prices.studentModelTest}</p>
              <p className="text-gray-600">Admission Test: ৳{prices.studentAdmissionTest}</p>
            </div>
          </div>
        </div>

        {/* Set New Prices Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700 flex items-center">
            <FileText className="mr-2 text-blue-600" /> Set New Prices (TK)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teacher Prices */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center">
                <User className="mr-2 text-blue-600" /> Teacher Prices
              </h3>
              <div>
                <label className="block text-gray-700">MCQ (TK)</label>
                <input
                  type="number"
                  name="teacherMCQ"
                  value={formData.teacherMCQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">CQ (TK)</label>
                <input
                  type="number"
                  name="teacherCQ"
                  value={formData.teacherCQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">SQ (TK)</label>
                <input
                  type="number"
                  name="teacherSQ"
                  value={formData.teacherSQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Model Test (TK)</label>
                <input
                  type="number"
                  name="teacherModelTest"
                  value={formData.teacherModelTest}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Admission Test (TK)</label>
                <input
                  type="number"
                  name="teacherAdmissionTest"
                  value={formData.teacherAdmissionTest}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Student Prices */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700 flex items-center">
                <Users className="mr-2 text-green-600" /> Student Prices
              </h3>
              <div>
                <label className="block text-gray-700">MCQ (TK)</label>
                <input
                  type="number"
                  name="studentMCQ"
                  value={formData.studentMCQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">CQ (TK)</label>
                <input
                  type="number"
                  name="studentCQ"
                  value={formData.studentCQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">SQ (TK)</label>
                <input
                  type="number"
                  name="studentSQ"
                  value={formData.studentSQ}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Model Test (TK)</label>
                <input
                  type="number"
                  name="studentModelTest"
                  value={formData.studentModelTest}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Admission Test (TK)</label>
                <input
                  type="number"
                  name="studentAdmissionTest"
                  value={formData.studentAdmissionTest}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:bg-gray-400"
            disabled={loading}
          >
            <Save className="mr-2" /> {loading ? "Saving..." : "Save Prices"}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default PriceSetQuestion;