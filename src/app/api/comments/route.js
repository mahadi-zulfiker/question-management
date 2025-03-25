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

        const comments = await db.collection("comments").find({ questionId }).toArray();
        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { questionId, comment, commenter, commenterId, parentCommentId } = await req.json();

        if (!questionId || !comment || !commenter || !commenterId) {
            return NextResponse.json({ success: false, error: "Question ID, comment, commenter, and commenterId are required" }, { status: 400 });
        }

        const newComment = {
            questionId,
            comment,
            commenter,
            commenterId,
            parentCommentId: parentCommentId || null,
            createdAt: new Date(),
            likes: 0,
        };

        const result = await db.collection("comments").insertOne(newComment);
        return NextResponse.json({ success: true, data: { ...newComment, _id: result.insertedId } });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}