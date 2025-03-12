import React, { useState, useEffect, useRef } from "react";
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
  Search,
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
  const [searchEmail, setSearchEmail] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [discountEmail, setDiscountEmail] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [specialDiscounts, setSpecialDiscounts] = useState({ teachers: [], students: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchPrices();
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClickOutside = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowSuggestions(false);
    }
  };

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
      }
      if (data.users) {
        const teacherDiscounts = data.users
          .filter(user => user.userType === "Teacher" && user.discount > 0)
          .map(user => ({
            email: user.email,
            discount: user.discount, // Percentage
            discountedPrices: calculateDiscountedPrices(user.userType, user.discount, data.prices),
          }));
        const studentDiscounts = data.users
          .filter(user => user.userType === "Student" && user.discount > 0)
          .map(user => ({
            email: user.email,
            discount: user.discount, // Percentage
            discountedPrices: calculateDiscountedPrices(user.userType, user.discount, data.prices),
          }));
        setSpecialDiscounts({ teachers: teacherDiscounts, students: studentDiscounts });
      }
      toast.success("Data loaded successfully!", { position: "top-right" });
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch data: " + err.message, { position: "top-right" });
      setLoading(false);
    }
  };

  const calculateDiscountedPrices = (userType, discountPercentage, basePrices) => {
    const discountFactor = 1 - (discountPercentage / 100);
    const prefix = userType === "Teacher" ? "teacher" : "student";
    return {
      MCQ: (basePrices[`${prefix}MCQ`] * discountFactor).toFixed(2),
      CQ: (basePrices[`${prefix}CQ`] * discountFactor).toFixed(2),
      SQ: (basePrices[`${prefix}SQ`] * discountFactor).toFixed(2),
      ModelTest: (basePrices[`${prefix}ModelTest`] * discountFactor).toFixed(2),
      AdmissionTest: (basePrices[`${prefix}AdmissionTest`] * discountFactor).toFixed(2),
    };
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchEmail(value);
    if (value.length > 1) {
      try {
        const response = await fetch(`/api/priceSetQuestions?email=${encodeURIComponent(value)}`);
        const data = await response.json();
        if (data.users && data.users.length > 0) {
          setSuggestions(data.users.map(user => user.email));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        toast.error("Error fetching suggestions: " + err.message, { position: "top-right" });
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (email) => {
    setSearchEmail(email);
    setDiscountEmail(email);
    setShowSuggestions(false);
    fetchUserDiscount(email);
  };

  const fetchUserDiscount = async (email) => {
    try {
      const response = await fetch(`/api/priceSetQuestions?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        setDiscountEmail(user.email);
        setDiscountPercentage(user.discount || "");
        toast.success("User found!", { position: "top-right" });
      } else {
        setDiscountEmail("");
        setDiscountPercentage("");
        toast.warn("User not found.", { position: "top-right" });
      }
    } catch (err) {
      toast.error("Failed to fetch user: " + err.message, { position: "top-right" });
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountEmail || !discountPercentage || discountPercentage < 0 || discountPercentage > 100) {
      toast.warn("Please select a user and enter a valid discount percentage (0-100).", { position: "top-right" });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("/api/priceSetQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, discounts: [{ email: discountEmail, discount: discountPercentage }] }),
      });
      const data = await response.json();
      if (data.message === "Prices and discounts updated successfully") {
        fetchPrices(); // Refresh to update special discounts
        setDiscountEmail("");
        setDiscountPercentage("");
        setSearchEmail("");
        setSuggestions([]);
        setShowSuggestions(false);
        toast.success("Discount applied successfully!", { position: "top-right" });
      } else {
        toast.error("Failed to apply discount: " + data.message, { position: "top-right" });
      }
      setLoading(false);
    } catch (err) {
      toast.error("Error applying discount: " + err.message, { position: "top-right" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/priceSetQuestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, discounts: [] }),
      });
      const data = await response.json();
      if (data.message === "Prices and discounts updated successfully") {
        setPrices({ ...formData });
        toast.success("Prices updated successfully!", { position: "top-right" });
      } else {
        toast.error("Failed to update prices: " + data.message, { position: "top-right" });
      }
    } catch (err) {
      toast.error("Error updating prices: " + err.message, { position: "top-right" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center">
            <DollarSign className="mr-2 sm:mr-3 text-blue-600" /> Price & Discount Manager
          </h1>
          <button
            onClick={() => fetchPrices()}
            className="mt-4 sm:mt-0 p-2 sm:p-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-200"
            disabled={loading}
          >
            <RefreshCw className={`h-5 sm:h-6 w-5 sm:w-6 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <p className="text-gray-600 mb-8 text-center text-sm sm:text-base">
          Manage pricing and discounts for MCQ, CQ, SQ, Model Tests, and Admission Tests in Taka (TK).
        </p>

        {/* Search and Discount Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-600" /> Apply Special Discount
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700">Search User by Email</label>
              <div className="relative" ref={searchRef}>
                <input
                  type="text"
                  value={searchEmail}
                  onChange={handleSearchChange}
                  placeholder="Enter email..."
                  className="w-full p-3 sm:p-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-sm sm:text-base"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600"
                >
                  <Search className="h-5 sm:h-6 w-5 sm:w-6" />
                </button>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestions.map((email, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(email)}
                        className="p-3 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm sm:text-base"
                      >
                        {email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-700">Set Discount (%)</label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  placeholder="0-100%"
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="bg-blue-600 text-white p-3 sm:p-4 rounded-xl hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 text-sm sm:text-base"
                  disabled={loading || !discountEmail || !discountPercentage || discountPercentage < 0 || discountPercentage > 100}
                >
                  Apply Discount
                </button>
              </div>
              {discountEmail && (
                <p className="text-gray-600 mt-2">Selected User: {discountEmail}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Prices Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <BookOpen className="mr-2 text-blue-600" /> Current Prices (TK)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <User className="mr-2 text-blue-600" /> For Teachers
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">MCQ: ৳{prices.teacherMCQ}</p>
                <p className="text-gray-700">CQ: ৳{prices.teacherCQ}</p>
                <p className="text-gray-700">SQ: ৳{prices.teacherSQ}</p>
                <p className="text-gray-700">Model Test: ৳{prices.teacherModelTest}</p>
                <p className="text-gray-700">Admission Test: ৳{prices.teacherAdmissionTest}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 sm:p-6 rounded-2xl shadow-md">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                <Users className="mr-2 text-green-600" /> For Students
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">MCQ: ৳{prices.studentMCQ}</p>
                <p className="text-gray-700">CQ: ৳{prices.studentCQ}</p>
                <p className="text-gray-700">SQ: ৳{prices.studentSQ}</p>
                <p className="text-gray-700">Model Test: ৳{prices.studentModelTest}</p>
                <p className="text-gray-700">Admission Test: ৳{prices.studentAdmissionTest}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Set New Prices Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
            <FileText className="mr-2 text-blue-600" /> Set New Prices (TK)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Teacher Prices */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <User className="mr-2 text-blue-600" /> Teacher Prices
              </h3>
              {["MCQ", "CQ", "SQ", "ModelTest", "AdmissionTest"].map((type) => (
                <div key={type}>
                  <label className="block text-gray-700">{type} (TK)</label>
                  <input
                    type="number"
                    name={`teacher${type}`}
                    value={formData[`teacher${type}`]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [`teacher${type}`]: e.target.value }))}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Student Prices */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-800 flex items-center">
                <Users className="mr-2 text-green-600" /> Student Prices
              </h3>
              {["MCQ", "CQ", "SQ", "ModelTest", "AdmissionTest"].map((type) => (
                <div key={type}>
                  <label className="block text-gray-700">{type} (TK)</label>
                  <input
                    type="number"
                    name={`student${type}`}
                    value={formData[`student${type}`]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [`student${type}`]: e.target.value }))}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Special Discounts Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
              <FileText className="mr-2 text-blue-600" /> Special Discounts (%)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <User className="mr-2 text-blue-600" /> Teachers
                </h3>
                {specialDiscounts.teachers.length === 0 ? (
                  <p className="text-gray-600">No special discounts for teachers.</p>
                ) : (
                  specialDiscounts.teachers.map(discount => (
                    <div key={discount.email} className="text-gray-700">
                      <p>{discount.email}: {discount.discount}%</p>
                      <div className="ml-4 text-sm">
                        <p>MCQ: ৳{discount.discountedPrices.MCQ}</p>
                        <p>CQ: ৳{discount.discountedPrices.CQ}</p>
                        <p>SQ: ৳{discount.discountedPrices.SQ}</p>
                        <p>Model Test: ৳{discount.discountedPrices.ModelTest}</p>
                        <p>Admission Test: ৳{discount.discountedPrices.AdmissionTest}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-green-50 p-4 sm:p-6 rounded-2xl shadow-md">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <Users className="mr-2 text-green-600" /> Students
                </h3>
                {specialDiscounts.students.length === 0 ? (
                  <p className="text-gray-600">No special discounts for students.</p>
                ) : (
                  specialDiscounts.students.map(discount => (
                    <div key={discount.email} className="text-gray-700">
                      <p>{discount.email}: {discount.discount}%</p>
                      <div className="ml-4 text-sm">
                        <p>MCQ: ৳{discount.discountedPrices.MCQ}</p>
                        <p>CQ: ৳{discount.discountedPrices.CQ}</p>
                        <p>SQ: ৳{discount.discountedPrices.SQ}</p>
                        <p>Model Test: ৳{discount.discountedPrices.ModelTest}</p>
                        <p>Admission Test: ৳{discount.discountedPrices.AdmissionTest}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 sm:p-4 rounded-xl hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:bg-gray-400 text-sm sm:text-base"
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