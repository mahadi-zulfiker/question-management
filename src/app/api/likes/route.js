import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const questionId = url.searchParams.get("questionId");

        if (!questionId) {
            return NextResponse.json({ success: false, error: "Question ID is required" }, { status: 400 });
        }

        const likes = await db.collection("likes").find({ questionId }).toArray();
        const userId = req.headers.get("x-user-id"); // Assuming user ID is passed in headers (or get from session)
        const liked = userId ? likes.some(like => like.userId === userId) : false;

        return NextResponse.json({ success: true, count: likes.length, liked });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { questionId, userId } = await req.json();

        if (!questionId || !userId) {
            return NextResponse.json({ success: false, error: "Question ID and user ID are required" }, { status: 400 });
        }

        const existingLike = await db.collection("likes").findOne({ questionId, userId });

        if (existingLike) {
            // Unlike the question
            await db.collection("likes").deleteOne({ questionId, userId });
            const likes = await db.collection("likes").find({ questionId }).toArray();
            return NextResponse.json({ success: true, count: likes.length, liked: false });
        } else {
            // Like the question
            await db.collection("likes").insertOne({ questionId, userId, createdAt: new Date() });
            const likes = await db.collection("likes").find({ questionId }).toArray();
            return NextResponse.json({ success: true, count: likes.length, liked: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}