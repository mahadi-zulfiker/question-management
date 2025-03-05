"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, CheckCircle, AlertCircle, Pencil } from "lucide-react";

export default function StudentProfile() {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        institute: "",
        degree: "",
        bio: "",
        skills: "",
    });

    useEffect(() => {
        if (status === "authenticated") {
            fetch("/api/studentProfile")
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setProfile(data.student);
                        setFormData({
                            username: data.student.username || "",
                            email: data.student.email || "",
                            institute: data.student.institute || "",
                            degree: data.student.degree || "",
                            bio: data.student.bio || "",
                            skills: data.student.skills || "",
                        });
                    } else {
                        setError("Profile not found");
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError("Failed to load profile");
                    setLoading(false);
                });
        }
    }, [status]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("/api/studentProfile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (res.ok) {
            const updatedData = await res.json();
            setProfile(updatedData.student);
            toast.success("Profile updated successfully!", {
                icon: <CheckCircle size={20} />,
            });
        } else {
            toast.error("Failed to update profile", {
                icon: <AlertCircle size={20} />,
            });
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
            </div>
        );

    if (error)
        return (
            <div className="text-center text-red-500 py-10">
                <AlertCircle className="inline-block mr-2" />
                {error}
            </div>
        );

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200 mt-10">
            <ToastContainer position="top-right" autoClose={3000} />

            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Pencil className="text-blue-500" /> Student Profile
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-semibold text-gray-700">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block font-semibold text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                </div>

                <div>
                    <label className="block font-semibold text-gray-700">Institute Name</label>
                    <input
                        type="text"
                        name="institute"
                        value={formData.institute}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block font-semibold text-gray-700">Degree</label>
                    <input
                        type="text"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block font-semibold text-gray-700">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div>
                    <label className="block font-semibold text-gray-700">Skills (comma-separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold"
                >
                    <Pencil size={20} /> Update Profile
                </button>
            </form>
        </div>
    );
}
