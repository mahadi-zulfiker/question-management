import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const classNumber = url.searchParams.get("classNumber");
        const subject = url.searchParams.get("subject");

        let query = {};
        if (classNumber) query.classNumber = parseInt(classNumber);
        if (subject) query.subject = subject;

        const classes = await db.collection("classes").find(query).toArray();
        return NextResponse.json({ classes }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}