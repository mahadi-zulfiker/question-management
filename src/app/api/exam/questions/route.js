import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        const classNumber = url.searchParams.get("classNumber");
        const subject = url.searchParams.get("subject");
        const chapterNumber = url.searchParams.get("chapterNumber");

        let collectionName;
        if (type === "MCQ") collectionName = "mcqs";
        else if (type === "CQ") collectionName = "cqs";
        else if (type === "SQ") collectionName = "SQ";
        else return NextResponse.json({ error: "Invalid question type" }, { status: 400 });

        const query = {
            classNumber: parseInt(classNumber),
            subject,
            chapterNumber: parseInt(chapterNumber),
        };

        const questions = await db.collection(collectionName).find(query).toArray();
        return NextResponse.json({ questions }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}