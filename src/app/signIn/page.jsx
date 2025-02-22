"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineArrowRight } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import img from "../../../public/login.jpg";

const SignIn = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Login Successful!");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <ToastContainer />
      <Navbar />

      <div className="flex flex-1 items-center justify-center py-12 px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white shadow-xl rounded-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 relative hidden md:block">
            <Image src={img} alt="Sign In" layout="fill" objectFit="cover" className="rounded-l-lg" />
          </div>

          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">Welcome Back</h2>
            <p className="text-sm text-gray-600 text-center mt-2">Sign in to continue your journey!</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                className={`w-full py-2 text-white rounded-md shadow-md transition ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blues-600"}`}
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="mt-4 text-sm text-center text-gray-700">
              Don’t have an account?{' '}
              <Link href="/signUp" className="text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1">
                Sign Up <AiOutlineArrowRight />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignIn;
