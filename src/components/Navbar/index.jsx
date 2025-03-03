"use client";

import React, { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    const userType = session?.user?.userType?.toLowerCase();

    const dashboardRoutes = {
        admin: "/dashboard/admin",
        student: "/dashboard/student",
        teacher: "/dashboard/teacher",
    };

    const toggleMenu = () => setIsOpen(!isOpen);
    const getDashboardLink = () => dashboardRoutes[userType] || "/dashboard";
    const handleDashboardRedirect = () => router.push(getDashboardLink());

    return (
        <nav className="bg-white shadow-md relative z-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <Link href="/">
                            <h1 className="text-2xl font-bold text-gradient-to-r from-[#1b0a37] to-[#24104f]">QA</h1>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center bg-gray-100 rounded-md px-3 py-2">
                        <Search className="h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="কোর্স, বিষয়ের নাম লিখুন..."
                            className="bg-transparent outline-none ml-2 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="hidden md:flex space-x-8">
                        {menuItems.map((item, index) => (
                            <Link key={index} href={item.link} className="text-gray-700 hover:text-[#24104f]">
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex space-x-4">
                        {session ? (
                            <>
                                <button
                                    onClick={handleDashboardRedirect}
                                    className="px-4 py-2 bg-[#24104f] text-white rounded-md hover:bg-[#1b0a37]"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 border border-[#24104f] text-[#24104f] rounded-md hover:bg-[#1b0a37] hover:text-white"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/signIn" className="px-4 py-2 border border-[#24104f] text-[#24104f] rounded-md hover:bg-[#1b0a37] hover:text-white">
                                    Login
                                </Link>
                                <Link href="/signUp" className="px-4 py-2 bg-[#24104f] text-white rounded-md hover:bg-[#1b0a37]">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button onClick={toggleMenu}>{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
                    </div>
                </div>

                {isOpen && (
                    <div className="md:hidden bg-white shadow-md rounded-md p-4">
                        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 my-2">
                            <Search className="h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="কোর্স, বিষয়ের নাম লিখুন..."
                                className="bg-transparent outline-none ml-2 text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.link}
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="mt-4">
                            {session ? (
                                <>
                                    <button
                                        onClick={handleDashboardRedirect}
                                        className="block w-full text-center px-4 py-2 bg-[#24104f] text-white rounded-md hover:bg-[#1b0a37]"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-center px-4 py-2 mt-2 border border-[#24104f] text-[#24104f] rounded-md hover:bg-[#1b0a37] hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/signIn"
                                        className="block w-full text-center px-4 py-2 border border-[#24104f] text-[#24104f] rounded-md hover:bg-[#1b0a37] hover:text-white"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signUp"
                                        className="block w-full text-center px-4 py-2 mt-2 bg-[#24104f] text-white rounded-md hover:bg-[#1b0a37]"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const menuItems = [
    { name: "ক্লাস ৪-১২", link: "/classes" },
    { name: "মডেল টেস্ট", link: "/modelTests" },
    { name: "ভর্তি পরীক্ষা", link: "/admission" },
    { name: "প্রশ্নব্যাংক", link: "/questionBank" },
    { name: "পরীক্ষা তৈরি", link: "/createExam" },
    { name: "পরীক্ষা দিন", link: "/takeExam" },
    { name: "প্যাকেজ", link: "/packages" },
];

export default Navbar;