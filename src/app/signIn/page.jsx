"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineArrowRight } from "react-icons/ai";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { toast, ToastContainer } from "react-toastify";
import { signIn, useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SignIn() {
    const router = useRouter();
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const session = useSession()
    const onSubmit = async (data) => {
        setLoading(true);

        const res = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        console.log("🔍 SignIn Response:", res);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Login Successful!");
            router.push("/");
        }
        setLoading(false);
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
                    <h2 className="text-3xl font-extrabold text-center text-gray-900">Sign In</h2>
                    <p className="text-sm text-center text-gray-600">Welcome back! Please sign in to your account.</p>

                    <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className="w-full px-4 py-2 mt-1 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                placeholder="Enter your email"
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm text-gray-700">Password</label>
                            <input
                                id="password"
                                type="password"
                                {...register("password", { required: "Password is required" })}
                                className="w-full px-4 py-2 mt-1 bg-gray-200 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                placeholder="Enter your password"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-2 text-white rounded-md shadow-md transition ${loading ? "bg-gray-400" : "bg-orange-500 hover:bg-orange-600"}`}
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-center text-gray-700">
                        Don’t have an account?{" "}
                        <Link href="/signUp">
                            <span className="flex items-center justify-center gap-1 text-orange-500 hover:text-orange-700">
                                Sign Up <AiOutlineArrowRight />
                            </span>
                        </Link>
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    );
}

export default SignIn;
