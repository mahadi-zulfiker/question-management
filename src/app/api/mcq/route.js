import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { question, options, correctAnswer } = await req.json();

        if (!question || !options.length || correctAnswer === null) {
            return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
        }
        
        const mcqCollection = db.collection("mcqs");
        const newMCQ = { question, options, correctAnswer };
        const result = await mcqCollection.insertOne(newMCQ);
        
        return NextResponse.json({ 
            message: "MCQ Created", 
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
