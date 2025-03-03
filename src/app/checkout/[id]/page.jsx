"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { BsWallet2 } from "react-icons/bs";

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const [packageData, setPackageData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPackageDetails() {
            if (!id) return;
            try {
                const response = await axios.get(`/api/package/${id}`);
                setPackageData(response.data);
            } catch (error) {
                console.error("Error fetching package:", error);
                toast.error("প্যাকেজ লোড করতে ব্যর্থ হয়েছে।");
            } finally {
                setLoading(false);
            }
        }
        fetchPackageDetails();
    }, [id]);

    async function handlePayment() {
        if (!paymentMethod) {
            toast.error("অনুগ্রহ করে পেমেন্টের মাধ্যম নির্বাচন করুন।");
            return;
        }
        try {
            await axios.post("/api/checkout", {
                packageId: id,
                paymentMethod,
            });
            toast.success("পেমেন্ট সফল হয়েছে! রিডাইরেক্ট করা হচ্ছে...");
            setTimeout(() => router.push("/packages"), 2000);
        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        }
    }

    if (loading) return <p className="text-center text-blue-500">লোড হচ্ছে...</p>;
    if (!packageData) return <p className="text-center text-red-500">প্যাকেজ লোড করতে ব্যর্থ হয়েছে।</p>;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Navbar />
            <ToastContainer position="top-center" autoClose={3000} />
            <div className="max-w-5xl mx-auto py-12 px-6 lg:px-12 bg-white shadow-lg rounded-lg flex flex-col lg:flex-row gap-8">
                <div className="flex-1 p-6 bg-blue-50 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-blue-700 mb-4">আপনার প্যাকেজ</h2>
                    <div className="flex items-center gap-4 p-4 bg-white shadow-md rounded-lg">
                        <FaCheckCircle className="text-green-500 text-4xl" />
                        <div>
                            <h3 className="text-2xl font-semibold">{packageData.name}</h3>
                            <p className="text-gray-700">{packageData.description}</p>
                            <p className="text-blue-700 font-bold text-2xl mt-2">৳{packageData.cost}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-6 bg-gray-50 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold mb-4">পেমেন্টের মাধ্যম নির্বাচন করুন</h3>
                    <div className="flex flex-col gap-4">
                        <button
                            className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-lg font-semibold w-full ${paymentMethod === "Daricomma Wallet" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
                            onClick={() => setPaymentMethod("Question management")}
                        >
                            <BsWallet2 className="text-2xl" /> Question management
                        </button>
                        <button
                            className={`flex items-center gap-3 px-5 py-4 rounded-lg transition-all text-lg font-semibold w-full ${paymentMethod === "বিকাশ" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
                            onClick={() => setPaymentMethod("বিকাশ")}
                        >
                            <FaMoneyBillWave className="text-2xl" /> বিকাশ
                        </button>
                    </div>
                    <button
                        className={`w-full py-4 rounded-lg text-xl font-bold transition-all mt-6 ${paymentMethod ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}
                        onClick={handlePayment}
                        disabled={!paymentMethod}
                    >
                        পেমেন্ট সম্পন্ন করি
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
