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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <ToastContainer />
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-12 px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 relative hidden md:block">
            <Image src={img} alt="Sign Up" layout="fill" objectFit="cover" className="rounded-l-lg" />
          </div>

          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">Create an Account</h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Join as a {userType.toLowerCase()} and start today!
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  {...register("username", { required: "Username is required" })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
                {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">Register as:</p>
                <div className="flex space-x-4">
                  {['Student', 'Teacher'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`px-3 py-2 rounded-md ${userType === type ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'}`}
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
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your institution name"
                  />
                  <p className="text-sm text-gray-600 mt-2">Teachers can buy questions for 0.25৳ each, upload their own notes/questions, and generate PDFs with custom headers.</p>
                </div>

              )}

              <button type="submit" className="w-full py-2 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-700">
              Already have an account?
              <Link href="/signIn" className="text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1">
                Sign In <AiOutlineArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
