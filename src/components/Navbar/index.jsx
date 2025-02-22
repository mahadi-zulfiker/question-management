"use client";
import React, { useState } from "react";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: session, status } = useSession();
    const router = useRouter();

    const userType = session?.user?.userType?.toLowerCase();

    const dashboardRoutes = {
        admin: "/dashboard/admin",
        student: "/dashboard/student",
        teacher: "/dashboard/teacher",
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    const toggleDropdown = (index) => {
        setDropdownOpen(dropdownOpen === index ? null : index);
    };

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
                            <div key={index} className="relative group">
                                <button
                                    onClick={() => toggleDropdown(index)}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-[#24104f]"
                                >
                                    <span>{item.name}</span>
                                    {item.sublinks && <ChevronDown className="h-4 w-4" />}
                                </button>
                                {item.sublinks && dropdownOpen === index && (
                                    <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50">
                                        {item.sublinks.map((sublink, subIndex) => (
                                            <Link key={subIndex} href={sublink.link}>
                                                <span className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                                    {sublink.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
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
                    <div className="md:hidden bg-white shadow-md rounded-md">
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
                            <div key={index}>
                                <button
                                    onClick={() => toggleDropdown(index)}
                                    className="w-full flex justify-between px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    <span>{item.name}</span>
                                    {item.sublinks && <ChevronDown className="h-4 w-4" />}
                                </button>
                                {item.sublinks && dropdownOpen === index && (
                                    <div className="bg-gray-50 rounded-md py-2">
                                        {item.sublinks.map((sublink, subIndex) => (
                                            <Link key={subIndex} href={sublink.link}>
                                                <span className="block px-8 py-2 text-gray-700 hover:bg-gray-200 cursor-pointer">
                                                    {sublink.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

const menuItems = [
    {
        name: "ক্লাস ৪-১২",
        sublinks: [
            { name: "ক্লাস ৪", link: "/class-4" },
            { name: "ক্লাস ৫", link: "/class-5" },
            { name: "ক্লাস ৬", link: "/class-6" },
            { name: "ক্লাস ৭", link: "/class-7" },
            { name: "ক্লাস ৮", link: "/class-8" },
            { name: "ক্লাস ৯", link: "/class-9" },
            { name: "ক্লাস ১০", link: "/class-10" },
            { name: "ক্লাস ১১", link: "/class-11" },
            { name: "ক্লাস ১২", link: "/class-12" },
        ],
    },
    {
        name: "স্কিলস",
        sublinks: [
            { name: "প্রোগ্রামিং", link: "/programming" },
            { name: "ডিজাইন", link: "/design" },
            { name: "ডিজিটাল মার্কেটিং", link: "/marketing" },
            { name: "কনটেন্ট রাইটিং", link: "/content-writing" },
            { name: "ফ্রিল্যান্সিং", link: "/freelancing" },
            { name: "ভিডিও এডিটিং", link: "/video-editing" },
            { name: "SEO", link: "/seo" },
        ],
    },
    {
        name: "ভর্তি পরীক্ষা",
        sublinks: [
            { name: "বিশ্ববিদ্যালয় ভর্তি", link: "/university-admission" },
            { name: "বিসিএস প্রস্তুতি", link: "/bcs" },
            { name: "মেডিকেল ভর্তি", link: "/medical-admission" },
            { name: "ইঞ্জিনিয়ারিং ভর্তি", link: "/engineering-admission" },
        ],
    },
    {
        name: "অনলাইন ব্যাচ",
        sublinks: [
            { name: "বিজ্ঞান বিভাগ", link: "/science-batch" },
            { name: "ব্যবসা শিক্ষা", link: "/business-batch" },
        ],
    },
    {
        name: "ইংলিশ সেন্টার",
        sublinks: [
            { name: "স্পোকেন ইংলিশ", link: "/spoken-english" },
            { name: "আইইএলটিএস", link: "/ielts" },
        ],
    },
];

export default Navbar;


