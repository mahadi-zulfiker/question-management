import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type") || "";
        const search = url.searchParams.get("search") || "";
        const teacherEmail = url.searchParams.get("teacherEmail");

        if (!teacherEmail) {
            return NextResponse.json({ success: false, error: "Teacher email is required" }, { status: 400 });
        }

        const collections = {
            mcq: db.collection("mcqs"),
            cq: db.collection("cqs"),
            sq: db.collection("SQ"),
        };

        let query = { teacherEmail };
        if (search) {
            query.$or = [
                { question: { $regex: search, $options: "i" } },
                { passage: { $regex: search, $options: "i" } }, // For CQ
                { subject: { $regex: search, $options: "i" } }, // For MCQ/CQ
                { subjectName: { $regex: search, $options: "i" } }, // For SQ
                { chapterName: { $regex: search, $options: "i" } },
            ];
        }

        let questions = [];

        if (!type || type === "mcq") {
            const mcqs = await collections.mcq
                .find(query)
                .toArray();
            questions = questions.concat(mcqs.map((q) => ({ ...q, type: "mcq" })));
        }

        if (!type || type === "cq") {
            const cqs = await collections.cq
                .find(query)
                .toArray();
            questions = questions.concat(cqs.map((q) => ({ ...q, type: "cq" })));
        }

        if (!type || type === "sq") {
            const sqs = await collections.sq
                .find(query)
                .toArray();
            questions = questions.concat(sqs.map((q) => ({ ...q, type: "sq" })));
        }

        return NextResponse.json({ success: true, data: questions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching teacher questions:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}