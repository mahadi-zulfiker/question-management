"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FaUser, FaFileAlt, FaMousePointer, FaEdit, FaEye, FaSyncAlt, FaTimes, FaLightbulb } from "react-icons/fa";

export default function ActivityChecker() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [userEmails, setUserEmails] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]); // New state for recommendations
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exportMessage, setExportMessage] = useState("");
  const activitiesPerPage = 10;

  // Fetch user emails when the component mounts
  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const res = await fetch("/api/users/get-emails", {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `ইউজার ইমেইল লোড করতে ব্যর্থ হয়েছে। HTTP Status: ${res.status}`);
        }
        const emails = await res.json();
        if (!Array.isArray(emails)) throw new Error("ইউজার ইমেইল ডেটা সঠিক ফরম্যাটে নেই।");
        setUserEmails(emails.filter((email) => email !== "admin123@gmail.com").sort());
      } catch (error) {
        console.error("Error fetching user emails:", error);
        setError(error.message || "ইউজার ইমেইল লোড করতে একটি ত্রুটি হয়েছে।");
      }
    };
    fetchUserEmails();
  }, []);

  // Memoized fetchActivities function
  const fetchActivities = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        ...(emailFilter && { email: emailFilter }),
        page: currentPage,
        limit: activitiesPerPage,
        ...(dateRange.start && { start: dateRange.start }),
        ...(dateRange.end && { end: dateRange.end }),
      }).toString();

      const res = await fetch(`/api/activity/get?${query}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `অ্যাক্টিভিটি লোড করতে ব্যর্থ হয়েছে। HTTP Status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.activities || !Array.isArray(data.activities)) {
        throw new Error("অ্যাক্টিভিটি ডেটা সঠিক ফরম্যাটে নেই।");
      }

      setActivities(data.activities);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(error.message || "অ্যাক্টিভিটি লোড করতে একটি ত্রুটি হয়েছে।");
      setActivities([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [emailFilter, dateRange, activitiesPerPage]);

  // Fetch activities and recommendations when dependencies change
  useEffect(() => {
    fetchActivities(page);
  }, [emailFilter, dateRange, page, fetchActivities]);

  // Generate recommendations based on activities
  const generateRecommendations = useCallback((activities) => {
    const formSubmissions = activities.filter((activity) => activity.action === "form_submission").length;
    const editorInteractions = activities.filter((activity) => activity.action === "editor_interaction").length;
    const lastVisit = activities.find((activity) => activity.action === "page_visit")?.timestamp;

    const recs = [];
    if (formSubmissions > 5) {
      recs.push("এই ইউজার প্রায়ই ফর্ম জমা দেন। তাদের একটি প্রিমিয়াম প্যাকেজ অফার করুন।");
    }
    if (editorInteractions > 10) {
      recs.push("এই ইউজার এডিটরে অনেক সময় ব্যয় করেন। এডিটর উন্নতকরণ প্যাকেজ অফার করুন।");
    }
    if (lastVisit && new Date() - new Date(lastVisit) > 7 * 24 * 60 * 60 * 1000) {
      recs.push("এই ইউজার সম্প্রতি ভিজিট করেননি। তাদের একটি ডিসকাউন্ট অফার পাঠান।");
    }
    return recs;
  }, []);

  // Update recommendations when activities change
  useEffect(() => {
    if (activities.length > 0 && emailFilter) {
      setRecommendations(generateRecommendations(activities));
    } else {
      setRecommendations([]);
    }
  }, [activities, emailFilter, generateRecommendations]);

  // Handle email filter change
  const handleEmailFilterChange = (newEmail) => {
    setEmailFilter(newEmail);
    setPage(1);
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    setPage(1);
  };

  // Handle page navigation
  const handlePreviousPage = () => page > 1 && setPage((prev) => prev - 1);
  const handleNextPage = () => page < totalPages && setPage((prev) => prev + 1);

  // Calculate summary stats
  const totalActivities = activities.length;
  const uniqueUsers = [...new Set(activities.map((activity) => activity.userEmail))].length;

  // Format metadata
  const formatMetadata = (metadata) =>
    Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="flex gap-2">
        <span className="font-semibold bangla-text">{key}:</span>
        <span className="bangla-text">{typeof value === "object" ? JSON.stringify(value) : value}</span>
      </div>
    ));

  // Action map
  const actionMap = {
    page_visit: { label: "পেজ ভিজিট", icon: <FaEye className="text-blue-500" />, tooltip: "ইউজার একটি পেজে প্রবেশ করেছেন" },
    route_change: { label: "রাউট পরিবর্তন", icon: <FaSyncAlt className="text-green-500" />, tooltip: "ইউজার একটি নতুন পেজে গিয়েছেন" },
    form_submission: { label: "ফর্ম জমা", icon: <FaFileAlt className="text-purple-500" />, tooltip: "ইউজার একটি ফর্ম জমা দিয়েছেন" },
    click: { label: "ক্লিক", icon: <FaMousePointer className="text-orange-500" />, tooltip: "ইউজার একটি বোতাম বা লিঙ্কে ক্লিক করেছেন" },
    editor_interaction: { label: "এডিটর ইন্টারঅ্যাকশন", icon: <FaEdit className="text-teal-500" />, tooltip: "ইউজার এডিটরে কাজ করেছেন" },
  };

  // Export activities to CSV
  const exportActivitiesToCSV = () => {
    const headers = ["ইউজারের ইমেইল", "অ্যাকশন", "বিস্তারিত", "সময়"];
    const rows = activities.map((activity) => [
      activity.userEmail,
      actionMap[activity.action]?.label || activity.action,
      JSON.stringify(activity.metadata),
      new Date(activity.timestamp).toLocaleString("bn-BD"),
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "activities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMessage("অ্যাক্টিভিটি সফলভাবে CSV হিসেবে এক্সপোর্ট করা হয়েছে!");
    setTimeout(() => setExportMessage(""), 3000);
  };

  // Export recommendations to CSV
  const exportRecommendationsToCSV = () => {
    if (!emailFilter) {
      setError("সুপারিশ এক্সপোর্ট করতে একটি ইউজার ইমেইল নির্বাচন করুন।");
      return;
    }
    const headers = ["ইউজারের ইমেইল", "সুপারিশ"];
    const rows = recommendations.map((rec) => [emailFilter, rec]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "recommendations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMessage("সুপারিশ সফলভাবে CSV হিসেবে এক্সপোর্ট করা হয়েছে!");
    setTimeout(() => setExportMessage(""), 3000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!session || session.user.email !== "admin123@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-center text-red-500 bangla-text text-xl font-semibold">
          প্রবেশাধিকার নিষিদ্ধ। শুধুমাত্র অ্যাডমিন (admin123@gmail.com) প্রবেশ করতে পারবেন।
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 bangla-text">অ্যাক্টিভিটি চেকার ড্যাশবোর্ড</h1>
        <button
          onClick={() => fetchActivities(page)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bangla-text shadow-md ${
            loading ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
          }`}
        >
          <FaSyncAlt /> {loading ? "লোড হচ্ছে..." : "রিফ্রেশ করুন"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
          <FaUser className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 bangla-text">সক্রিয় ইউজার</h3>
            <p className="text-2xl font-bold text-blue-700 bangla-text">{uniqueUsers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
          <FaFileAlt className="text-3xl text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 bangla-text">মোট অ্যাক্টিভিটি</h3>
            <p className="text-2xl font-bold text-purple-700 bangla-text">{totalActivities}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 bangla-text">ইউজার ফিল্টার</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">ইউজার ইমেইল নির্বাচন করুন</label>
            <select
              value={emailFilter}
              onChange={(e) => handleEmailFilterChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bangla-text"
            >
              <option value="">সকল ইউজার</option>
              {userEmails.length === 0 ? (
                <option value="" disabled>কোনো ইউজার পাওয়া যায়নি</option>
              ) : (
                userEmails.map((email) => (
                  <option key={email} value={email}>{email}</option>
                ))
              )}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">অথবা ইমেইল লিখুন</label>
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => handleEmailFilterChange(e.target.value)}
              placeholder="ইউজারের ইমেইল লিখুন"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bangla-text"
            />
          </div>
          {emailFilter && (
            <button
              onClick={() => handleEmailFilterChange("")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300 bangla-text shadow-md mt-8 md:mt-0"
            >
              <FaTimes /> ফিল্টার সাফ করুন
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">শুরুর তারিখ</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">শেষের তারিখ</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => handleDateRangeChange({ start: "", end: "" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300 bangla-text shadow-md mt-8 md:mt-0"
            >
              <FaTimes /> তারিখ ফিল্টার সাফ করুন
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg bangla-text">{error}</div>
      )}

      {exportMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-lg bangla-text">{exportMessage}</div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700 bangla-text">
              {emailFilter ? `${emailFilter} এর অ্যাক্টিভিটি` : "সকল ইউজারের অ্যাক্টিভিটি"}
            </h2>
            {(dateRange.start || dateRange.end) && (
              <p className="text-sm text-gray-500 bangla-text mt-1">
                তারিখ পরিসীমা: {dateRange.start || "শুরু"} থেকে {dateRange.end || "শেষ"}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportActivitiesToCSV}
              disabled={activities.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bangla-text shadow-md ${
                activities.length === 0 ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-green-600 text-white hover:bg-green-700 hover:scale-105"
              }`}
            >
              <FaFileAlt /> অ্যাক্টিভিটি এক্সপোর্ট (CSV)
            </button>
            {emailFilter && (
              <button
                onClick={exportRecommendationsToCSV}
                disabled={activities.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bangla-text shadow-md ${
                  activities.length === 0 ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105"
                }`}
              >
                <FaFileAlt /> সুপারিশ এক্সপোর্ট (CSV)
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bangla-text">
            কোনো অ্যাক্টিভিটি পাওয়া যায়নি। দয়া করে ফিল্টার চেক করুন অথবা নতুন অ্যাক্টিভিটি তৈরি করুন।
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-gray-700">
                    <th className="border p-4 text-left bangla-text">ইউজারের ইমেইল</th>
                    <th className="border p-4 text-left bangla-text">অ্যাকশন</th>
                    <th className="border p-4 text-left bangla-text">বিস্তারিত</th>
                    <th className="border p-4 text-left bangla-text">সময়</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={activity._id || index} className="hover:bg-gray-50 transition">
                      <td className="border p-4">{activity.userEmail}</td>
                      <td className="border p-4">
                        <div className="group relative flex items-center gap-2 bangla-text">
                          {actionMap[activity.action]?.icon || null}
                          <span>{actionMap[activity.action]?.label || activity.action}</span>
                          <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm rounded-lg p-2 -top-10 left-0 bangla-text z-10">
                            {actionMap[activity.action]?.tooltip || "কোনো বিবরণ নেই"}
                          </div>
                        </div>
                      </td>
                      <td className="border p-4 text-gray-600">{formatMetadata(activity.metadata)}</td>
                      <td className="border p-4 bangla-text">{new Date(activity.timestamp).toLocaleString("bn-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bangla-text shadow-md ${
                  page === 1 ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                }`}
              >
                পূর্ববর্তী
              </button>
              <span className="text-gray-700 bangla-text">পৃষ্ঠা {page} এর মধ্যে {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bangla-text shadow-md ${
                  page === totalPages ? "bg-gray-300 cursor-not-allowed text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                }`}
              >
                পরবর্তী
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 bangla-text">সুপারিশ</h2>
        {!emailFilter ? (
          <p className="text-gray-500 bangla-text text-center py-4">সুপারিশ দেখতে একটি ইউজার ইমেইল নির্বাচন করুন।</p>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 bangla-text text-center py-4">এই ইউজারের জন্য কোনো অ্যাক্টিভিটি পাওয়া যায়নি।</p>
        ) : recommendations.length > 0 ? (
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg shadow-sm bangla-text text-gray-800">
                <FaLightbulb className="text-teal-500 text-xl mt-1" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 bangla-text text-center py-4">সুপারিশ তৈরি করার জন্য পর্যাপ্ত অ্যাক্টিভিটি নেই।</p>
        )}
      </div>
    </div>
  );
}