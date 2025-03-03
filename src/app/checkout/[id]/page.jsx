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
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alreadyPurchased, setAlreadyPurchased] = useState(false);

    useEffect(() => {
        async function fetchPackageDetails() {
            if (!id || !session?.user?.email) return;
            try {
                const response = await axios.get(`/api/package/${id}`);
                setPackageData(response.data);

                const purchaseCheck = await axios.post("/api/check-purchase", {
                    packageId: id,
                    email: session.user.email,
                });

                if (purchaseCheck.data.alreadyPurchased) {
                    setAlreadyPurchased(true);
                }
            } catch (error) {
                toast.error("প্যাকেজ লোড করতে ব্যর্থ হয়েছে।");
            } finally {
                setLoading(false);
            }
        }
        fetchPackageDetails();
    }, [id, session]);

    async function handlePayment() {
        if (!paymentMethod) {
            toast.error("অনুগ্রহ করে পেমেন্টের মাধ্যম নির্বাচন করুন।");
            return;
        }
        if (alreadyPurchased) {
            toast.error("আপনার এই প্যাকেজ ইতিমধ্যে সক্রিয় রয়েছে।");
            return;
        }
        try {
            await axios.post("/api/checkout", {
                packageId: id,
                paymentMethod,
                email: session.user.email,
            });
            toast.success("পেমেন্ট সফল হয়েছে! রিডাইরেক্ট করা হচ্ছে...");
            setTimeout(() => router.push("/packages"), 2000);
        } catch (error) {
            toast.error("পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        }
    }

    if (loading) return <p className="text-center text-blue-500">লোড হচ্ছে...</p>;
    if (!packageData) return <p className="text-center text-red-500">প্যাকেজ লোড করতে ব্যর্থ হয়েছে।</p>;

    return (
        <div>
            <Navbar />
            <div className="bg-gray-200 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                <ToastContainer position="top-center" autoClose={3000} />
                <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-2xl font-bold">Package</h1>
                        <h2 className="text-xl font-semibold">{packageData.name}</h2>
                        <p className="text-gray-500">মেয়াদ {packageData.validity}</p>
                    </div>
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-semibold">পেমেন্ট ডিটেইলস</h3>
                        <div className="flex justify-between text-sm mt-2">
                            <span>প্যাকেজ মূল্য</span>
                            <span>৳{packageData.cost}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span>ডিসকাউন্ট</span>
                            <span>৳০</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold mt-2">
                            <span>সর্বমোট</span>
                            <span>৳{packageData.cost}</span>
                        </div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">পেমেন্টের মাধ্যম</h3>
                    <div className="mt-2 flex flex-col gap-2">
                        <button
                            className={`flex items-center gap-3 p-3 border rounded-lg w-full text-left ${paymentMethod === "বিকাশ" ? "border-red-500 bg-red-100" : "border-gray-300"}`}
                            onClick={() => setPaymentMethod("বিকাশ")}
                        >
                            <BsWallet2 className="text-xl" /> বিকাশ
                        </button>
                        <button
                            className={`flex items-center gap-3 p-3 border rounded-lg w-full text-left ${paymentMethod === "Question Management" ? "border-green-500 bg-green-100" : "border-gray-300"}`}
                            onClick={() => setPaymentMethod("Question Management")}
                        >
                            <BsWallet2 className="text-xl" /> Question Management
                        </button>
                    </div>
                    <button
                        className={`w-full py-3 rounded-lg text-white font-bold mt-6 transition-all ${paymentMethod && !alreadyPurchased ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                        onClick={handlePayment}
                        disabled={!paymentMethod || alreadyPurchased}
                    >
                        {alreadyPurchased ? "ইতিমধ্যে কেনা হয়েছে" : "পেমেন্ট সম্পন্ন করি"}
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
