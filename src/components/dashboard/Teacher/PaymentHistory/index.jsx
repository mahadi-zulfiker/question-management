"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function PaymentHistory() {
    const { data: session, status } = useSession();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "authenticated") {
            fetch(`/api/paymentHistoryTeacher?email=${session.user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    setPayments(data.payments);
                    setLoading(false);
                })
                .catch(() => {
                    setError("Failed to load payments.");
                    setLoading(false);
                });
        }
    }, [session, status]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-gray-500 w-10 h-10" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <AlertTriangle className="w-6 h-6 mr-2" /> {error}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">💳 Payment History</h1>
            
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 bg-white">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-3 text-left text-gray-600">ID</th>
                            <th className="p-3 text-left text-gray-600">Package</th>
                            <th className="p-3 text-left text-gray-600">Amount ($)</th>
                            <th className="p-3 text-left text-gray-600">Payment Method</th>
                            <th className="p-3 text-left text-gray-600">Status</th>
                            <th className="p-3 text-left text-gray-600">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr key={payment._id} className="border-b hover:bg-gray-50 transition-all">
                                    <td className="p-3 text-gray-800">{payment._id.slice(-6)}</td>
                                    <td className="p-3 text-gray-800">{payment.packageName}</td>
                                    <td className="p-3 text-gray-800 font-semibold">${payment.amount}</td>
                                    <td className="p-3 text-gray-800">{payment.paymentMethod}</td>
                                    <td className="p-3">
                                        {payment.status === "Success" ? (
                                            <span className="px-3 py-1 text-white bg-green-500 rounded-md flex items-center w-fit">
                                                <CheckCircle className="w-4 h-4 mr-1" /> {payment.status}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 text-white bg-red-500 rounded-md flex items-center w-fit">
                                                <XCircle className="w-4 h-4 mr-1" /> {payment.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-gray-800">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-4 text-center text-gray-500 italic">
                                    No payment history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
