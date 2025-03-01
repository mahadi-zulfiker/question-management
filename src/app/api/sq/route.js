import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { type, question, answer, classLevel, division, subjectName, subjectPart, chapterName } = await req.json();

        // Validate required fields
        if (!type || !question || !answer || !classLevel || !subjectName || !chapterName) {
            return NextResponse.json({ error: "সব ক্ষেত্র পূরণ করুন" }, { status: 400 });
        }

        const collection = db.collection("SQ");
        await collection.insertOne({
            type,
            question,
            answer,
            classLevel,
            division: division || null,
            subjectName,
            subjectPart: subjectPart || null,
            chapterName,
            createdAt: new Date()
        });

        return NextResponse.json({ message: "✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে" }, { status: 201 });
    } catch (error) {
        console.error("❌ Database Error:", error);
        return NextResponse.json({ error: "সার্ভার সমস্যা হয়েছে" }, { status: 500 });
    }
}