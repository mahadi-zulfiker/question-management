import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const email = url.searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const transactions = await db.collection("transactions").find({ email }).toArray();

        return NextResponse.json({ success: true, payments: transactions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
