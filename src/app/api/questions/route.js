// app/api/questions/route.js
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type");
        const search = url.searchParams.get("search") || "";

        let questions = [];

        if (type === "mcq") {
            questions = await db.collection("mcqs").find(
                { question: { $regex: search, $options: "i" } }
            ).toArray();
            questions = questions.map(q => ({ ...q, type: "mcq" })); // Ensure type is set

        } else if (type === "cq") {
            questions = await db.collection("cqs").find(
                { 
                    $or: [
                        { passage: { $regex: search, $options: "i" } },
                        { questions: { $regex: search, $options: "i" } }  // 🔥 Now searches in questions too
                    ]
                }
            ).toArray();
            questions = questions.map(q => ({ ...q, type: "cq" }));

        } else if (type === "sq") {
            questions = await db.collection("SQ").find(
                { question: { $regex: search, $options: "i" } }
            ).toArray();
            questions = questions.map(q => ({ ...q, type: "sq" }));

        } else {
            // Fetch all questions
            const mcqs = await db.collection("mcqs").find({ question: { $regex: search, $options: "i" } }).toArray();
            const cqs = await db.collection("cqs").find(
                { 
                    $or: [
                        { passage: { $regex: search, $options: "i" } },
                        { questions: { $regex: search, $options: "i" } }
                    ]
                }
            ).toArray();
            const sqs = await db.collection("SQ").find({ question: { $regex: search, $options: "i" } }).toArray();

            questions = [
                ...mcqs.map(q => ({ ...q, type: "mcq" })),
                ...cqs.map(q => ({ ...q, type: "cq" })),
                ...sqs.map(q => ({ ...q, type: "sq" }))
            ];
        }

        return NextResponse.json({ success: true, data: questions });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
