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

        // Dynamically set query fields based on collection
        let query = {};
        if (classNumber) {
            query[collectionName === "SQ" ? "classLevel" : "classNumber"] = parseInt(classNumber);
        }
        if (subject) {
            query[collectionName === "SQ" ? "subjectName" : "subject"] = subject;
        }
        if (chapterNumber) {
            query.chapterNumber = parseInt(chapterNumber); // Assuming chapterNumber is consistent across all collections
        }

        console.log("Query:", query); // Debug log to verify the query

        const questions = await db.collection(collectionName).find(query).toArray();
        console.log("Questions found:", questions); // Debug log to verify results

        return NextResponse.json({ questions }, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}