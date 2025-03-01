import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { title, type, duration, questions } = await req.json();

        if (!title || !type || !duration || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "পরীক্ষার শিরোনাম, ধরন, সময়সীমা এবং প্রশ্ন নির্বাচন করুন" }, { status: 400 });
        }

        const collection = db.collection("Exams");

        const examData = {
            title,
            type,
            duration,
            questions,
            createdAt: new Date(),
        };

        await collection.insertOne(examData);

        return NextResponse.json({ message: "✅ পরীক্ষা সফলভাবে সংরক্ষিত হয়েছে" }, { status: 201 });

    } catch (error) {
        console.error("❌ Database Error:", error);
        return NextResponse.json({ error: "সার্ভার সমস্যা হয়েছে" }, { status: 500 });
    }
}
