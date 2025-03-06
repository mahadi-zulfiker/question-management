import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const studentEmail = url.searchParams.get("studentEmail");

        if (!studentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
            return NextResponse.json({ error: "Valid studentEmail is required" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const certificates = await db.collection("certificates").find({
            studentEmail,
            issued: true
        }).toArray();

        return NextResponse.json(certificates, { status: 200 });
    } catch (error) {
        console.error("Error fetching student certificates:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}