"use client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreatePackage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.post("/api/package", data);
            toast.success("Package created successfully!");
        } catch (error) {
            toast.error("Failed to create package. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-lg p-6 bg-white shadow-2xl rounded-lg border border-gray-200">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Create Package</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Package Name</label>
                        <input {...register("name", { required: "Package name is required" })} 
                               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Package Cost ($)</label>
                        <input type="number" {...register("cost", { required: "Cost is required" })} 
                               className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Validity</label>
                        <select {...register("validity", { required: "Select a validity period" })} 
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Select validity</option>
                            <option value="1 month">1 Month</option>
                            <option value="6 months">6 Months</option>
                            <option value="1 year">1 Year</option>
                        </select>
                        {errors.validity && <p className="text-red-500 text-sm mt-1">{errors.validity.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea {...register("description", { required: "Description is required" })} 
                                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Benefits</label>
                        <textarea {...register("benefits", { required: "Benefits are required" })} 
                                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        {errors.benefits && <p className="text-red-500 text-sm mt-1">{errors.benefits.message}</p>}
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300" disabled={loading}>
                        {loading ? "Creating..." : "Create Package"}
                    </button>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable theme="colored" />
        </div>
    );
}