import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const classNumber = url.searchParams.get("classNumber");

        if (classNumber) {
            const classData = await db.collection("classes").find({ classNumber: parseInt(classNumber) }).toArray();
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


export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const body = await req.json();

        // Extract values correctly
        const { question, options, correctAnswer, classNumber, subject, chapterNumber, chapterName, subjectPart, teacherEmail } = body;

        // Validate required fields
        if (
            !question ||
            !Array.isArray(options) ||
            options.length < 2 ||
            correctAnswer === null ||
            correctAnswer < 0 || correctAnswer >= options.length ||
            !classNumber ||
            !subject ||
            !chapterNumber ||
            !chapterName
        ) {
            return NextResponse.json({ error: "Invalid Data", details: body }, { status: 400 });
        }

        const mcqCollection = db.collection("mcqs");

        const newMCQ = {
            question,
            options,
            correctAnswer,
            classNumber: parseInt(classNumber, 10),
            subject,
            chapterNumber: parseInt(chapterNumber, 10),
            chapterName,
            subjectPart: subjectPart || null,
            teacherEmail: teacherEmail || "admin",
            createdAt: new Date(),
        };

        const result = await mcqCollection.insertOne(newMCQ);

        return NextResponse.json({
            message: "MCQ Created Successfully",
            mcq: { _id: result.insertedId, ...newMCQ },
        }, { status: 201 });

    } catch (error) {
        console.error("❌ Server Error:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}


