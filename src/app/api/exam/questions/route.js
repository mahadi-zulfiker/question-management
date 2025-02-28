import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        let questions = [];

        if (type === "MCQ") {
            questions = await db.collection("mcqs").find({}).toArray();
        } else if (type === "CQ") {
            questions = await db.collection("cqs").find({}).toArray();
        } else if (type === "SQ") {
            questions = await db.collection("SQ").find({}).toArray();
        } else {
            return NextResponse.json({ error: "Invalid question type" }, { status: 400 });
        }

        return NextResponse.json({ questions }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}
