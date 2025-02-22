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

const SignUp = () => {
  const [userType, setUserType] = useState("Student");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      });

      console.log("🟢 Response from API:", response);

      if (response.status === 201) {
        toast.success("Signup successful! You can now sign in.", {
          position: "top-right",
          autoClose: 3000,
        });
        reset();
      }
    } catch (error) {
      console.error("🔴 API Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Something went wrong", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <ToastContainer />
      <Navbar />
      <section className="relative flex items-center justify-center min-h-screen bg-gray-100 py-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 bg-orange-300 rounded-full top-10 left-10 opacity-30 blur-3xl animate-pulse"></div>
          <div className="absolute w-80 h-80 bg-orange-400 rounded-full bottom-20 right-20 opacity-30 blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">Sign Up</h2>
          <p className="text-sm text-center text-gray-600">
            Create your account and join as {userType.toLowerCase()}!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                {...register("username", { required: "Username is required" })}
                className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Choose a username"
              />
              {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Enter a valid email",
                  },
                })}
                className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                className="w-full px-4 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">Register as:</p>
              <div className="flex items-center space-x-4">
                {["Student", "Teacher"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-3 py-2 rounded-md ${userType === type ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-orange-400 hover:text-white"}`}
                    onClick={() => setUserType(type)}
                  >
                    <span className="text-sm">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-2 text-white bg-orange-500 rounded-md shadow-md hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-700">
            Already have an account?{" "}
            <Link href="/signIn" className="flex items-center justify-center gap-1 text-orange-500 hover:text-orange-700">
              Sign In <AiOutlineArrowRight />
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SignUp;
