"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import img from "../../../../../public/register.jpg";

const CreateModerator = () => {
  const { data: session, status } = useSession();
  const [moderators, setModerators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    fetchModerators();
  }, []);

  const fetchModerators = async () => {
    try {
      const response = await fetch("/api/morderators", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch moderators");
      const data = await response.json();
      setModerators(data);
    } catch (err) {
      toast.error("Error fetching moderators", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/morderators/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success("Moderator created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      reset();
      fetchModerators();
    } catch (err) {
      toast.error(err.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this moderator?")) return;

    try {
      const response = await fetch(`/api/morderators/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success("Moderator deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchModerators();
    } catch (err) {
      toast.error(err.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <ToastContainer />
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            Manage Moderators
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-4">
            Create and manage moderators for your platform with ease.
          </p>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl overflow-hidden flex flex-col md:flex-row animate-fadeInUp">
            <div className="md:w-1/2 relative hidden md:block">
              <Image
                src={img}
                alt="Moderator Management"
                layout="fill"
                objectFit="cover"
                className="rounded-l-xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
            </div>

            <div className="w-full md:w-1/2 p-8">
              <h2 className="text-2xl font-semibold text-blue-700 mb-6">Create New Moderator</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter moderator email"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter moderator password"
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 text-white rounded-xl shadow-md transition ${
                    isLoading ? "bg-gray-400" : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Moderator"}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6">Existing Moderators</h2>
            {moderators.length === 0 ? (
              <p className="text-gray-600">No moderators found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moderators.map((moderator) => (
                      <tr key={moderator.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moderator.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moderator.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(moderator.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(moderator.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateModerator;