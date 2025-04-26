// app/dashboard/admin/page.jsx
"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/dashboard/MainLayout";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signIn");
      return;
    }

    const userType = session?.user?.userType?.toLowerCase();
    if (userType !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  const userType = session?.user?.userType?.toLowerCase();
  if (userType !== "admin") {
    return null;
  }

  return <MainLayout />;
}