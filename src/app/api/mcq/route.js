import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const body = await req.json();
        console.log("Received Data:", body);

        const { question, options, correctAnswer, classLevel, division, subjectName, subjectPart, chapterName } = body;

        if (!question || !Array.isArray(options) || options.length < 2 || correctAnswer === null || !classLevel || !subjectName || !chapterName) {
            return NextResponse.json({ error: "Invalid Data", details: body }, { status: 400 });
        }

        const mcqCollection = db.collection("mcqs");
        const newMCQ = { question, options, correctAnswer, classLevel, division, subjectName, subjectPart, chapterName };
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

export async function GET() {
    try {
        const db = await connectMongoDB();
        const mcqCollection = db.collection("mcqs");
        const mcqs = await mcqCollection.find().toArray();
        return NextResponse.json(mcqs);
    } catch (error) {
        console.error("❌ Fetching MCQs Failed:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}
