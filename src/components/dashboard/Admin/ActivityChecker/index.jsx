// app/admin/activity-checker/page.js
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaUser, FaFileAlt, FaMousePointer, FaEdit, FaEye, FaSyncAlt, FaTimes } from "react-icons/fa";

export default function ActivityChecker() {
  const { data: session, status } = useSession();
  const [activities, setActivities] = useState([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [userEmails, setUserEmails] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); // State for date range
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const activitiesPerPage = 10;

  // Check if the user is the admin with email admin123@gmail.com
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

  // Fetch user emails when the component mounts
  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const res = await fetch("/api/users/get-emails", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error("ইউজার ইমেইল লোড করতে ব্যর্থ হয়েছে।");
        }
        const emails = await res.json();
        // Exclude admin email from the list
        setUserEmails(emails.filter((email) => email !== "admin123@gmail.com").sort());
      } catch (error) {
        console.error("Error fetching user emails:", error);
        setError(error.message || "ইউজার ইমেইল লোড করতে একটি ত্রুটি হয়েছে।");
      }
    };

    fetchUserEmails();
  }, []);

  // Fetch activities when email filter, page, or date range changes
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = emailFilter
        ? `?email=${emailFilter}&page=${page}&limit=${activitiesPerPage}${
            dateRange.start ? `&start=${dateRange.start}` : ""
          }${dateRange.end ? `&end=${dateRange.end}` : ""}`
        : `?page=${page}&limit=${activitiesPerPage}${
            dateRange.start ? `&start=${dateRange.start}` : ""
          }${dateRange.end ? `&end=${dateRange.end}` : ""}`;
      const res = await fetch(`/api/activity/get${query}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("অ্যাক্টিভিটি লোড করতে ব্যর্থ হয়েছে।");
      }
      const data = await res.json();
      // Filter out admin activities
      const filteredActivities = data.activities.filter(
        (activity) => activity.userEmail !== "admin123@gmail.com"
      );
      setActivities(filteredActivities || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(error.message || "অ্যাক্টিভিটি লোড করতে একটি ত্রুটি হয়েছে।");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [emailFilter, page, dateRange]);

  // Generate recommendations based on user activity
  const getRecommendations = (activities) => {
    const formSubmissions = activities.filter(
      (activity) => activity.action === "form_submission"
    ).length;
    const editorInteractions = activities.filter(
      (activity) => activity.action === "editor_interaction"
    ).length;
    const lastVisit = activities.find(
      (activity) => activity.action === "page_visit"
    )?.timestamp;

    const recommendations = [];
    if (formSubmissions > 5) {
      recommendations.push(
        "এই ইউজার প্রায়ই ফর্ম জমা দেন (যেমন, সৃজনশীল প্রশ্ন)। তাদের একটি প্রিমিয়াম প্যাকেজ অফার করুন যাতে উন্নত ফিচার রয়েছে।"
      );
    }
    if (editorInteractions > 10) {
      recommendations.push(
        "এই ইউজার এডিটরে অনেক সময় ব্যয় করেন। এডিটর ফিচারের জন্য সাপোর্ট প্রদান করুন বা একটি এডিটর উন্নতকরণ প্যাকেজ অফার করুন।"
      );
    }
    if (lastVisit && new Date() - new Date(lastVisit) > 7 * 24 * 60 * 60 * 1000) {
      recommendations.push(
        "এই ইউজার সম্প্রতি ভিজিট করেননি। তাদের পুনরায় আকৃষ্ট করতে একটি ডিসকাউন্ট অফার পাঠান।"
      );
    }
    return recommendations;
  };

  // Handle page navigation
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Calculate summary stats
  const totalActivities = activities.length;
  const uniqueUsers = [...new Set(activities.map((activity) => activity.userEmail))].length;

  // Format metadata into a readable list
  const formatMetadata = (metadata) => {
    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="flex gap-2">
        <span className="font-semibold bangla-text">{key}:</span>
        <span className="bangla-text">
          {typeof value === "object" ? JSON.stringify(value) : value}
        </span>
      </div>
    ));
  };

  // Map actions to icons, labels, and tooltips
  const actionMap = {
    page_visit: {
      label: "পেজ ভিজিট",
      icon: <FaEye className="text-blue-500" />,
      tooltip: "ইউজার একটি পেজে প্রবেশ করেছেন",
    },
    route_change: {
      label: "রাউট পরিবর্তন",
      icon: <FaSyncAlt className="text-green-500" />,
      tooltip: "ইউজার একটি নতুন পেজে গিয়েছেন",
    },
    form_submission: {
      label: "ফর্ম জমা",
      icon: <FaFileAlt className="text-purple-500" />,
      tooltip: "ইউজার একটি ফর্ম জমা দিয়েছেন",
    },
    click: {
      label: "ক্লিক",
      icon: <FaMousePointer className="text-orange-500" />,
      tooltip: "ইউজার একটি বোতাম বা লিঙ্কে ক্লিক করেছেন",
    },
    editor_interaction: {
      label: "এডিটর ইন্টারঅ্যাকশন",
      icon: <FaEdit className="text-teal-500" />,
      tooltip: "ইউজার এডিটরে কাজ করেছেন",
    },
  };

  // Export activities to CSV
  const exportToCSV = () => {
    const headers = ["ইউজারের ইমেইল", "অ্যাকশন", "বিস্তারিত", "সময়"];
    const rows = activities.map((activity) => [
      activity.userEmail,
      actionMap[activity.action]?.label || activity.action,
      JSON.stringify(activity.metadata),
      new Date(activity.timestamp).toLocaleString("bn-BD"),
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "activities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700 bangla-text">
          অ্যাক্টিভিটি চেকার ড্যাশবোর্ড
        </h1>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition bangla-text"
        >
          <FaSyncAlt /> রিফ্রেশ করুন
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
          <FaUser className="text-3xl text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 bangla-text">
              সক্রিয় ইউজার
            </h3>
            <p className="text-2xl font-bold text-blue-700 bangla-text">
              {uniqueUsers}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-4">
          <FaFileAlt className="text-3xl text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700 bangla-text">
              মোট অ্যাক্টিভিটি
            </h3>
            <p className="text-2xl font-bold text-purple-700 bangla-text">
              {totalActivities}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 bangla-text">
          ইউজার ফিল্টার
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">
              ইউজার ইমেইল নির্বাচন করুন
            </label>
            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bangla-text"
            >
              <option value="">সকল ইউজার</option>
              {userEmails.length === 0 ? (
                <option value="" disabled>
                  কোনো ইউজার পাওয়া যায়নি
                </option>
              ) : (
                userEmails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">
              অথবা ইমেইল লিখুন
            </label>
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="ইউজারের ইমেইল লিখুন"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bangla-text"
            />
          </div>
          {emailFilter && (
            <button
              onClick={() => setEmailFilter("")}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition bangla-text mt-8 md:mt-0"
            >
              <FaTimes /> ফিল্টার সাফ করুন
            </button>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">
              শুরুর তারিখ
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2 bangla-text">
              শেষের তারিখ
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(dateRange.start || dateRange.end) && (
            <button
              onClick={() => setDateRange({ start: "", end: "" })}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition bangla-text mt-8 md:mt-0"
            >
              <FaTimes /> তারিখ ফিল্টার সাফ করুন
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg bangla-text">
          {error}
        </div>
      )}

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700 bangla-text">
            {emailFilter ? `${emailFilter} এর অ্যাক্টিভিটি` : "সকল ইউজারের অ্যাক্টিভিটি"}
          </h2>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition bangla-text"
          >
            <FaFileAlt /> এক্সপোর্ট করুন (CSV)
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bangla-text">
            কোনো অ্যাক্টিভিটি পাওয়া যায়নি।
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
                    <tr key={index} className="hover:bg-gray-50 transition">
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
                      <td className="border p-4 text-gray-600">
                        {formatMetadata(activity.metadata)}
                      </td>
                      <td className="border p-4 bangla-text">
                        {new Date(activity.timestamp).toLocaleString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  page === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } bangla-text`}
              >
                পূর্ববর্তী
              </button>
              <span className="text-gray-700 bangla-text">
                পৃষ্ঠা {page} এর মধ্যে {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  page === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } bangla-text`}
              >
                পরবর্তী
              </button>
            </div>
          </>
        )}
      </div>

      {/* Recommendations Section */}
      {emailFilter && activities.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 bangla-text">
            {emailFilter} এর জন্য সুপারিশ
          </h2>
          {getRecommendations(activities).length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {getRecommendations(activities).map((rec, index) => (
                <li key={index} className="text-gray-700 bangla-text">
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 bangla-text">বর্তমানে কোনো সুপারিশ নেই।</p>
          )}
        </div>
      )}
    </div>
  );
}