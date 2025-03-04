import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const body = await req.json();

        const { question, options, correctAnswer, classLevel, division, subjectName, subjectPart, chapterName, teacherEmail } = body;

        if (!question || !Array.isArray(options) || options.length < 2 || correctAnswer === null || !classLevel || !subjectName || !chapterName) {
            return NextResponse.json({ error: "Invalid Data", details: body }, { status: 400 });
        }

        const mcqCollection = db.collection("mcqs");
        const newMCQ = { question, options, correctAnswer, classLevel, division, subjectName, subjectPart, chapterName, teacherEmail: teacherEmail || "admin", createdAt: new Date() };
        const result = await mcqCollection.insertOne(newMCQ);

        return NextResponse.json({
            message: "MCQ Created Successfully",
            mcq: { _id: result.insertedId, ...newMCQ }
        }, { status: 201 });
    } catch (error) {
        console.error("❌ Server Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const mcqCollection = db.collection("mcqs");
        const url = new URL(req.url);
        const teacherEmail = url.searchParams.get("teacherEmail");
        
        let filter = {};
        if (teacherEmail) {
            filter = { teacherEmail };
        }

        const mcqs = await mcqCollection.find(filter).toArray();
        return NextResponse.json(mcqs);
    } catch (error) {
        console.error("❌ Fetching MCQs Failed:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}