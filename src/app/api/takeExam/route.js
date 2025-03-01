import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get("examId");
        const db = await connectMongoDB();

        if (examId) {
            const exam = await db.collection("Exams").findOne({ _id: new ObjectId(examId) });
            if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

            exam.duration = Number(exam.duration);
            return NextResponse.json({ exam }, { status: 200 });
        } else {
            const exams = await db.collection("Exams").find({}).toArray();
            return NextResponse.json({ exams }, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching exams:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { examId, userEmail, answers } = await req.json();
        if (!examId || !userEmail || !answers)
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const db = await connectMongoDB();
        const exam = await db.collection("Exams").findOne({ _id: new ObjectId(examId) });
        if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

        const results = exam.questions.map((q) => {
            const userAnswer = answers[q._id] || null;
            let isCorrect = false;

            if (q.type === "MCQ") {
                isCorrect = userAnswer !== null && userAnswer === q.correctAnswer;
            } else if (q.type === "CQ" || q.type === "SQ") {
                isCorrect = null; // CQ & SQ are subjective, needs manual checking
            }

            return {
                questionId: q._id,
                type: q.type,
                userAnswer,
                isCorrect,
            };
        });

        const submission = {
            examId,
            userEmail,
            answers,
            results,
            submittedAt: new Date(),
        };

        await db.collection("submissions").insertOne(submission);
        return NextResponse.json({ message: "Exam submitted successfully!", submission }, { status: 200 });
    } catch (error) {
        console.error("Error submitting exam:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}