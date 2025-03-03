import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const { passage, questions, answers, classLevel, division, subjectName, subjectPart, chapterName } = await req.json();

        // Validate required fields
        if (!passage || questions.length !== 4 || answers.length !== 4 || !classLevel || !subjectName || !chapterName) {
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
            classLevel,
            division: division || null,
            subjectName,
            subjectPart: subjectPart || null,
            chapterName,
            createdAt: new Date(),
        };

        const result = await cqCollection.insertOne(newCQ);

        return NextResponse.json({ message: "✅ CQ সফলভাবে যোগ করা হয়েছে!", cq: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("CQ Insertion Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await connectMongoDB();
        const cqCollection = db.collection("cqs");
        const cqs = await cqCollection.find().toArray();

        return NextResponse.json(cqs);
    } catch (error) {
        console.error("CQ Fetch Error:", error);
        return NextResponse.json({ error: "❌ সার্ভারে সমস্যা হয়েছে!" }, { status: 500 });
    }
}
