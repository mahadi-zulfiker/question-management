import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { type, question, answer, classLevel, division, subjectName, subjectPart, chapterName, teacherEmail } = await req.json();

        // Validate required fields
        if (!type || !question || !answer || !classLevel || !subjectName || !chapterName) {
            return NextResponse.json({ error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" }, { status: 400 });
        }

        const collection = db.collection("SQ");

        const newSQ = {
            type,
            question,
            answer,
            classLevel,
            division: division || null,
            subjectName,
            subjectPart: subjectPart || null,
            chapterName,
            teacherEmail: teacherEmail || null, // ✅ Save email if teacher, otherwise null for admin
            createdAt: new Date(),
        };

        const result = await collection.insertOne(newSQ);

        return NextResponse.json({ message: "✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", sq: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("SQ Insertion Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await connectMongoDB();
        const collection = db.collection("SQ");
        const sqs = await collection.find().toArray();

        return NextResponse.json(sqs);
    } catch (error) {
        console.error("SQ Fetch Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}
