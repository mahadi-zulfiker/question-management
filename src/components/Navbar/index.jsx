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
        moderator: "/dashboard/moderator",
    };

    const toggleMenu = () => setIsOpen(!isOpen);
    const getDashboardLink = () => dashboardRoutes[userType] || "/dashboard";
    const handleDashboardRedirect = () => router.push(getDashboardLink());

    const allMenuItems = [
        { name: "ক্লাস ৪-১২", link: "/classes" },
        { name: "মডেল টেস্ট", link: "/modelTests" },
        { name: "ভর্তি পরীক্ষা", link: "/admission" },
        { name: "প্রশ্নব্যাংক", link: "/questionBank" },
        { name: "পরীক্ষা তৈরি", link: "/createExam" },
        { name: "অনলাইন পরীক্ষা", link: "/onlineExam" },
        { name: "প্যাকেজ", link: "/packages" },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (!session) {
            if (item.name === "পরীক্ষা তৈরি" || item.name === "পরীক্ষা দিন") {
                return false;
            }
        } else {
            if (userType === "student" && item.name === "পরীক্ষা তৈরি") {
                return false;
            }
        }
        return true;
    });

    return (
        <nav className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg sticky top-0 z-50">
            <div className="w-full px-8 sm:px-12 lg:px-16 relative">
                <div className="flex justify-between items-center py-5">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/">
                            <h1 className="text-3xl font-extrabold text-white tracking-wide">P.Edu</h1>
                        </Link>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center flex-1 justify-center">
                        {/* Search Bar */}
                        {/* <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-5 py-3 border border-white/20 mx-8 w-1/3">
                            <Search className="h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="কোর্স, বিষয়ের নাম লিখুন..."
                                className="bg-transparent outline-none ml-4 text-sm text-white placeholder-gray-300 w-full focus:w-full transition-all duration-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div> */}

                        {/* Menu Items */}
                        <div className="flex space-x-10">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.link}
                                    className="text-gray-200 text-lg font-medium hover:text-blue-300 transition-colors duration-200 relative group"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex space-x-6">
                        {session ? (
                            <>
                                <button
                                    onClick={handleDashboardRedirect}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => signOut()}
                                    className="px-6 py-3 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 hover:shadow-lg transition-all duration-300"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/signIn"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                                >
                                    Login
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button onClick={toggleMenu}>
                            {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-blue-800/95 backdrop-blur-lg rounded-b-xl p-8 absolute top-16 left-0 w-full shadow-xl animate-slideDown">
                        <div className="flex items-center bg-white/10 rounded-full px-5 py-3 mb-6 border border-white/20">
                            <Search className="h-5 w-5 text-gray-300" />
                            <input
                                type="text"
                                placeholder="কোর্স, বিষয়ের নাম লিখুন..."
                                className="bg-transparent outline-none ml-4 text-sm text-white placeholder-gray-300 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.link}
                                className="block px-4 py-4 text-gray-200 text-lg font-medium hover:bg-white/10 rounded-lg transition-colors duration-200"
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="mt-8 space-y-4">
                            {session ? (
                                <>
                                    <button
                                        onClick={handleDashboardRedirect}
                                        className="block w-full text-center px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => signOut()}
                                        className="block w-full text-center px-4 py-4 border border-white/20 text-white rounded-full font-semibold hover:bg-white/10 hover:shadow-lg transition-all duration-300"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/signin"
                                        className="block w-full text-center px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                                    >
                                        Login
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

export default Navbar;