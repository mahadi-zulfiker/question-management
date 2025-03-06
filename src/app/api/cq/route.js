import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const body = await req.json();

        // Extract values correctly
        const { passage, questions, answers, classNumber, division, subject, subjectPart, chapterNumber, chapterName, teacherEmail } = body;

        // Validate required fields
        if (!teacherEmail || !passage || questions.length !== 4 || answers.length !== 4 || !classNumber || !subject || !chapterNumber || !chapterName) {
            return NextResponse.json({ error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" }, { status: 400 });
        }

        // Assigning marks dynamically
        const marks = [1, 2, 3, 4];

        const cqCollection = db.collection("cqs");

        const newCQ = {
            passage,
            questions,
            answers,
            marks,
            classNumber: parseInt(classNumber, 10),
            division: division || null,
            subject,
            subjectPart: subjectPart || null,
            chapterNumber: parseInt(chapterNumber, 10),
            chapterName,
            teacherEmail,
            createdAt: new Date(),
        };

        const result = await cqCollection.insertOne(newCQ);

        return NextResponse.json({ message: "✅ CQ সফলভাবে যোগ করা হয়েছে!", cq: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("CQ Insertion Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const classNumber = url.searchParams.get("classNumber");

        if (classNumber) {
            const classData = await db.collection("classes").find({ classNumber: parseInt(classNumber, 10) }).toArray();
            return NextResponse.json(classData);
        } else {
            const allClasses = await db.collection("classes").find().toArray();
            return NextResponse.json(allClasses);
        }
    } catch (error) {
        console.error("❌ Fetching Classes Failed:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}