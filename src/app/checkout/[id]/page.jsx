"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle } from "react-icons/fa";
import { BsWallet2 } from "react-icons/bs";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [packageData, setPackageData] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [loading, setLoading] = useState(true);
    const [alreadyPurchased, setAlreadyPurchased] = useState(false);
    const [step, setStep] = useState(1); // 1: User Info, 2: Details, 3: Payment, 4: Confirmation
    const [userInfo, setUserInfo] = useState({
        name: "",
        phoneNumber: "",
        email: "",
    });
    const [transactionId, setTransactionId] = useState(null); // To store the transaction ID

    useEffect(() => {
        async function fetchPackageDetails() {
            if (!id || !session?.user?.email) {
                toast.error("Please log in to proceed with checkout.");
                setTimeout(() => router.push("/signIn"), 2000);
                return;
            }
            try {
                const response = await axios.get(`/api/package/${id}`);
                setPackageData(response.data);

                const purchaseCheck = await axios.post("/api/check-purchase", {
                    packageId: id,
                    email: session.user.email,
                });
                setAlreadyPurchased(purchaseCheck.data.alreadyPurchased);

                // Pre-fill email from session
                setUserInfo((prev) => ({
                    ...prev,
                    email: session.user.email,
                }));
            } catch (error) {
                toast.error("প্যাকেজ লোড করতে ব্যর্থ হয়েছে।");
            } finally {
                setLoading(false);
            }
        }
        fetchPackageDetails();
    }, [id, session, router]);

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateUserInfo = () => {
        const { name, phoneNumber, email } = userInfo;
        if (!name || !phoneNumber || !email) {
            toast.error("অনুগ্রহ করে সকল তথ্য পূরণ করুন।");
            return false;
        }
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            toast.error("অনুগ্রহ করে একটি বৈধ ফোন নম্বর প্রবেশ করান।");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("অনুগ্রহ করে একটি বৈধ ইমেইল প্রবেশ করান।");
            return false;
        }
        return true;
    };

    const handleProceedToDetails = () => {
        if (validateUserInfo()) {
            setStep(2);
        }
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error("অনুগ্রহ করে পেমেন্টের মাধ্যম নির্বাচন করুন।");
            return;
        }
        if (alreadyPurchased) {
            toast.error("আপনার এই প্যাকেজ ইতিমধ্যে সক্রিয় রয়েছে।");
            return;
        }
        setStep(3); // Move to payment confirmation step
        try {
            const response = await axios.post("/api/checkout", {
                packageId: id,
                paymentMethod,
                email: session.user.email,
                userInfo,
            });
            if (response.status === 200) {
                setTransactionId(response.data.transactionId); // Store the transaction ID
                toast.success(`পেমেন্ট সফল হয়েছে! Transaction ID: ${response.data.transactionId}`);
                setStep(4); // Move to confirmation step
                setTimeout(() => {
                    router.push("/packages");
                }, 3000);
            } else {
                throw new Error("Payment failed");
            }
        } catch (error) {
            toast.error("পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
            setStep(2); // Return to details step on failure
        }
    };

    const handleConfirm = () => {
        setStep(3); // Move to payment confirmation
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 flex items-center justify-center">
            <p className="text-2xl text-blue-700 animate-pulse">লোড হচ্ছে...</p>
        </div>
    );
    if (!packageData) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100 flex items-center justify-center">
            <p className="text-2xl text-red-600">প্যাকেজ লোড করতে ব্যর্থ হয়েছে।</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto py-12 px-6">
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-blue-100">
                    <div className="flex justify-center mb-8">
                        <div className="flex space-x-4">
                            <div className={`flex-1 text-center ${step >= 1 ? "text-indigo-900" : "text-gray-400"}`}>
                                <div className={`w-10 h-10 mx-auto rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-300"} flex items-center justify-center`}>
                                    1
                                </div>
                                <p className="mt-2 text-sm">User Info</p>
                            </div>
                            <div className={`flex-1 text-center ${step >= 2 ? "text-indigo-900" : "text-gray-400"}`}>
                                <div className={`w-10 h-10 mx-auto rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-300"} flex items-center justify-center`}>
                                    2
                                </div>
                                <p className="mt-2 text-sm">Details</p>
                            </div>
                            <div className={`flex-1 text-center ${step >= 3 ? "text-indigo-900" : "text-gray-400"}`}>
                                <div className={`w-10 h-10 mx-auto rounded-full ${step >= 3 ? "bg-blue-600" : "bg-gray-300"} flex items-center justify-center`}>
                                    3
                                </div>
                                <p className="mt-2 text-sm">Payment</p>
                            </div>
                            <div className={`flex-1 text-center ${step >= 4 ? "text-indigo-900" : "text-gray-400"}`}>
                                <div className={`w-10 h-10 mx-auto rounded-full ${step >= 4 ? "bg-blue-600" : "bg-gray-300"} flex items-center justify-center`}>
                                    4
                                </div>
                                <p className="mt-2 text-sm">Confirmation</p>
                            </div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <h1 className="text-3xl font-bold text-indigo-900">Your Information</h1>
                                <p className="text-gray-600">Please provide your details to proceed</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={userInfo.name}
                                        onChange={handleUserInfoChange}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={userInfo.phoneNumber}
                                        onChange={handleUserInfoChange}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-gray-800"
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userInfo.email}
                                        onChange={handleUserInfoChange}
                                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                                        placeholder="Enter your email address"
                                        disabled
                                    />
                                </div>
                            </div>
                            <button
                                className="w-full py-3 rounded-xl text-white font-bold transition-all bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                                onClick={handleProceedToDetails}
                            >
                                Next Step
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <h1 className="text-3xl font-bold text-indigo-900">Package Details</h1>
                                <h2 className="text-2xl font-semibold">{packageData.name}</h2>
                                <p className="text-gray-600">Validity: {packageData.validity}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl">
                                <h3 className="text-lg font-semibold text-indigo-900">Payment Details</h3>
                                <div className="flex justify-between mt-4">
                                    <span className="text-gray-700">Package Price</span>
                                    <span className="text-lg font-medium">৳{packageData.cost}</span>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-700">Discount</span>
                                    <span className="text-lg font-medium">৳0</span>
                                </div>
                                <div className="flex justify-between mt-4 text-xl font-bold">
                                    <span className="text-indigo-900">Total</span>
                                    <span className="text-indigo-900">৳{packageData.cost}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-indigo-900">Select Payment Method</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    className={`flex items-center gap-3 p-4 border rounded-xl transition-all ${paymentMethod === "বিকাশ" ? "border-blue-600 bg-blue-50" : "border-gray-300"} hover:bg-blue-50/50`}
                                    onClick={() => setPaymentMethod("বিকাশ")}
                                >
                                    <BsWallet2 className="text-2xl text-blue-600" />
                                    <span className="text-lg font-medium">বিকাশ</span>
                                </button>
                                <button
                                    className={`flex items-center gap-3 p-4 border rounded-xl transition-all ${paymentMethod === "Question Management" ? "border-blue-600 bg-blue-50" : "border-gray-300"} hover:bg-blue-50/50`}
                                    onClick={() => setPaymentMethod("Question Management")}
                                >
                                    <BsWallet2 className="text-2xl text-blue-600" />
                                    <span className="text-lg font-medium">Question Management</span>
                                </button>
                            </div>
                            <div className="flex justify-between gap-4">
                                <button
                                    className="py-2 px-6 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    className={`w-full py-3 rounded-xl text-white font-bold transition-all ${paymentMethod && !alreadyPurchased ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" : "bg-gray-400 cursor-not-allowed"}`}
                                    onClick={handleConfirm}
                                    disabled={!paymentMethod || alreadyPurchased}
                                >
                                    {alreadyPurchased ? "ইতিমধ্যে কেনা হয়েছে" : "পরবর্তী ধাপ"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <FaCheckCircle className="text-5xl text-blue-600 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-bold text-indigo-900">Confirm Payment</h2>
                            <p className="text-gray-700">
                                You have selected <strong>{paymentMethod}</strong> for ৳{packageData.cost}. Confirm to proceed.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="py-2 px-6 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all"
                                    onClick={() => setStep(2)}
                                >
                                    Back
                                </button>
                                <button
                                    className="py-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
                                    onClick={handlePayment}
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 text-center">
                            <FaCheckCircle className="text-5xl text-green-600 mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl font-bold text-indigo-900">Payment Successful!</h2>
                            <p className="text-gray-700">Thank you for your purchase. Your Transaction ID is:</p>
                            <p className="text-blue-600 font-semibold text-lg">{transactionId}</p>
                            <p className="text-gray-700">Redirecting to packages...</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}