import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get("examId");
        const classNumber = searchParams.get("classNumber");
        const subject = searchParams.get("subject");
        const db = await connectMongoDB();

        if (examId) {
            const exam = await db.collection("Exams").findOne({ _id: new ObjectId(examId) });
            if (!exam) {
                return NextResponse.json({ error: "Exam not found" }, { status: 404 });
            }
            exam.duration = Number(exam.duration);
            return NextResponse.json({ exam }, { status: 200 });
        }

        const query = {};
        if (classNumber) query.classNumber = parseInt(classNumber);
        if (subject) query.subject = subject;

        const exams = await db.collection("Exams").find(query).toArray();
        if (!exams.length && (classNumber || subject)) {
            return NextResponse.json({ message: "No exams found for the given filters" }, { status: 200 });
        }

        exams.forEach(exam => exam.duration = Number(exam.duration));
        return NextResponse.json({ exams }, { status: 200 });
    } catch (error) {
        console.error("Error fetching exams:", error.message);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { examId, userEmail, answers } = await req.json();
        if (!examId || !userEmail || !answers) {
            return NextResponse.json({ error: "Missing required fields: examId, userEmail, or answers" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const exam = await db.collection("Exams").findOne({ _id: new ObjectId(examId) });
        if (!exam) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        const results = exam.questions.map((q) => {
            const userAnswer = answers[q._id] || null;
            let isCorrect = null;

            if (q.type === "MCQ") {
                isCorrect = userAnswer !== null && userAnswer === q.correctAnswer;
                return {
                    questionId: q._id,
                    type: q.type,
                    userAnswer,
                    isCorrect,
                };
            } else if (q.type === "CQ") {
                // For CQ, userAnswer should be an object with sub-question answers
                const subAnswers = userAnswer || {};
                return {
                    questionId: q._id,
                    type: q.type,
                    userAnswer: subAnswers, // { subQuestion1: "answer1", subQuestion2: "answer2", ... }
                    isCorrect: null, // Manual grading required
                };
            } else if (q.type === "SQ") {
                // For SQ, userAnswer is a single string
                return {
                    questionId: q._id,
                    type: q.type,
                    userAnswer,
                    isCorrect: null, // Manual grading required
                };
            }
        });

        const submission = {
            examId,
            userEmail,
            answers,
            results,
            submittedAt: new Date(),
        };

        await db.collection("submissions").insertOne(submission);
        return NextResponse.json({ message: "Exam submitted successfully!", submission }, { status: 201 });
    } catch (error) {
        console.error("Error submitting exam:", error.message);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}