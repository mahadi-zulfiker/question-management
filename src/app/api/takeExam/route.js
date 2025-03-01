import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get("examId");

        const db = await connectMongoDB();

        if (examId) {
            // Fetch a single exam
            const exam = await db.collection("Exams").findOne({ _id: new ObjectId(examId) });
            if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

            exam.duration = Number(exam.duration); // Ensure duration is a number
            return NextResponse.json({ exam }, { status: 200 });
        } else {
            // Fetch all exams
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

        // Compute correct answers
        const correctAnswers = exam.questions.map((q) => q.correctAnswer);

        // Compare user answers with correct answers
        const results = Object.entries(answers).map(([qId, userAnswer], index) => ({
            questionId: qId,
            userAnswer,
            isCorrect: userAnswer === correctAnswers[index],
        }));

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
