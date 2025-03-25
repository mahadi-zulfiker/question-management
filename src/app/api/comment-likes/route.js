import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const commentId = url.searchParams.get("commentId");

        if (!commentId) {
            return NextResponse.json({ success: false, error: "Comment ID is required" }, { status: 400 });
        }

        const likes = await db.collection("comment_likes").find({ commentId }).toArray();
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
        const { commentId, userId } = await req.json();

        if (!commentId || !userId) {
            return NextResponse.json({ success: false, error: "Comment ID and user ID are required" }, { status: 400 });
        }

        const existingLike = await db.collection("comment_likes").findOne({ commentId, userId });

        if (existingLike) {
            // Unlike the comment
            await db.collection("comment_likes").deleteOne({ commentId, userId });
            const likes = await db.collection("comment_likes").find({ commentId }).toArray();
            return NextResponse.json({ success: true, count: likes.length, liked: false });
        } else {
            // Like the comment
            await db.collection("comment_likes").insertOne({ commentId, userId, createdAt: new Date() });
            const likes = await db.collection("comment_likes").find({ commentId }).toArray();
            return NextResponse.json({ success: true, count: likes.length, liked: true });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}