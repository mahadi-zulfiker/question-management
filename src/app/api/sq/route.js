import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { type, question, answer, classLevel, subjectName, subjectPart, chapterNumber, chapterName, teacherEmail } = await req.json();

        if (!type || !question || !answer || !classLevel || !subjectName || !chapterNumber || !chapterName) {
            return NextResponse.json({ error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" }, { status: 400 });
        }

        const collection = db.collection("SQ");
        const newSQ = {
            type,
            question,
            answer,
            classLevel: parseInt(classLevel, 10), // Keep as classLevel for SQ consistency
            subjectName,
            subjectPart: subjectPart || null,
            chapterNumber: parseInt(chapterNumber, 10),
            chapterName,
            teacherEmail: teacherEmail || null,
            createdAt: new Date(),
        };

        const result = await collection.insertOne(newSQ);
        return NextResponse.json({ message: "✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", sq: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("SQ Insertion Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const classNumber = url.searchParams.get("classNumber"); // Use classNumber instead of classLevel

        if (classNumber) {
            const classData = await db.collection("classes").find({ classNumber: parseInt(classNumber, 10) }).toArray();
            return NextResponse.json(classData);
        } else {
            const allClasses = await db.collection("classes").distinct("classNumber"); // Get unique classNumbers
            return NextResponse.json(allClasses.map(classNumber => ({ classNumber })));
        }
    } catch (error) {
        console.error("❌ Fetching Classes Failed:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}