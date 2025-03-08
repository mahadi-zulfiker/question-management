import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { title, type, duration, classNumber, subject, chapterNumber, questions } = await req.json();

        if (!title || !type || !duration || !classNumber || !subject || !chapterNumber || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({ error: "All fields and questions are required" }, { status: 400 });
        }

        const collection = db.collection("Exams");
        const examData = {
            title,
            type,
            duration,
            classNumber: parseInt(classNumber),
            subject,
            chapterNumber: parseInt(chapterNumber),
            questions,
            createdAt: new Date(),
        };

        await collection.insertOne(examData);
        return NextResponse.json({ message: "✅ Exam created successfully" }, { status: 201 });
    } catch (error) {
        console.error("❌ Database Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}