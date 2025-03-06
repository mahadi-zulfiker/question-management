import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const teacherEmail = url.searchParams.get("teacherEmail");

        const db = await connectMongoDB();

        if (!teacherEmail) {
            // Fetch unique teacher emails from all collections
            const mcqEmails = await db.collection("mcqs").distinct("teacherEmail");
            const cqEmails = await db.collection("cqs").distinct("teacherEmail");
            const sqEmails = await db.collection("SQ").distinct("teacherEmail");

            // Combine and deduplicate emails
            const allEmails = [...new Set([...mcqEmails, ...cqEmails, ...sqEmails])].filter(email => 
                email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            );
            return NextResponse.json({ teacherEmails: allEmails }, { status: 200 });
        }

        // Fetch questions for the specified teacherEmail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherEmail)) {
            return NextResponse.json({ error: "Valid teacherEmail is required" }, { status: 400 });
        }

        const mcqs = await db.collection("mcqs").find({ teacherEmail }).toArray();
        const cqs = await db.collection("cqs").find({ teacherEmail }).toArray();
        const sqs = await db.collection("SQ").find({ teacherEmail }).toArray();

        const categorizedQuestions = {
            mcqs: mcqs.map(q => ({ ...q, category: "MCQ" })),
            cqs: cqs.map(q => ({ ...q, category: "CQ" })),
            sqs: sqs.map(q => ({ ...q, category: "SQ" })),
        };

        return NextResponse.json(categorizedQuestions, { status: 200 });
    } catch (error) {
        console.error("Error fetching teacher questions:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}