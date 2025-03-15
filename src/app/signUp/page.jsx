"use client";

import { ToastContainer, toast } from "react-toastify";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineArrowRight } from "react-icons/ai";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import img from "../../../public/register.jpg";

const SignUp = () => {
  const [userType, setUserType] = useState("Student");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("monthly");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        userType,
        institutionName: userType === "Teacher" ? institutionName : undefined,
        subscriptionType: userType === "Student" ? subscriptionType : undefined,
      });

      if (response.status === 201) {
        toast.success("Signup successful! You can now sign in.", {
          position: "top-right",
          autoClose: 3000,
        });
        reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <ToastContainer />
      <Navbar />

      {/* Banner Section */}
      <section className="relative w-full py-32 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 animate-[wave_10s_ease-in-out_infinite]">
          <svg className="w-full h-40 text-blue-800/30" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,0 C280,80 720,20 1440,80 V100 H0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
            Create an Account
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-4">
            Join as a {userType.toLowerCase()} and start today!
          </p>
        </div>
      </section>

      {/* Sign Up Form Section */}
      <section className="py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl overflow-hidden flex flex-col md:flex-row animate-fadeInUp">
            <div className="md:w-1/2 relative hidden md:block">
              <Image
                src={img}
                alt="Sign Up"
                layout="fill"
                objectFit="cover"
                className="rounded-l-xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent" />
            </div>

            <div className="w-full md:w-1/2 p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    {...register("username", { required: "Username is required" })}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter your username"
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    placeholder="Enter your password"
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">Register as:</p>
                  <div className="flex space-x-4">
                    {["Student", "Teacher"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`px-4 py-2 rounded-md ${userType === type ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white"} transition-all`}
                        onClick={() => setUserType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {userType === "Student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subscription Type</label>
                    <select
                      value={subscriptionType}
                      onChange={(e) => setSubscriptionType(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                    >
                      <option value="monthly">Monthly - 200৳</option>
                      <option value="yearly">Yearly - 2000৳ (400৳ discount)</option>
                    </select>
                  </div>
                )}

                {userType === "Teacher" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="Enter your institution name"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Teachers can buy questions for 0.25৳ each, upload their own notes/questions, and generate PDFs with custom headers.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 text-white rounded-xl shadow-md transition ${isLoading ? "bg-gray-400" : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-700 text-lg">
                Already have an account?{' '}
                <Link href="/signIn" className="text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1">
                  Sign In <AiOutlineArrowRight />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SignUp;