"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AdminProfileManagement() {
  const { data: session, status } = useSession();
  const [adminData, setAdminData] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session.user?.email) {
      fetch(`/api/adminProfile?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setMessage(data.error);
          } else {
            setAdminData(data);
            setUsername(data.username);
          }
        })
        .catch(() => setMessage("Failed to load profile"));
    }
  }, [status, session]);

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/adminProfile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: adminData._id, username }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
  };

  if (status === "loading") return <p>Loading...</p>;
  if (!session || session.user.userType !== "Admin") return <p>Unauthorized</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Admin Profile</h1>
      {message && <p className="text-sm text-red-500">{message}</p>}
      {adminData && (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Email:</label>
            <p className="text-gray-600">{adminData.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </>
      )}
    </div>
  );
}
