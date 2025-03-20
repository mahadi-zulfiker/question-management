import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received body:", JSON.stringify(body, null, 2));
        
        const { questions } = body;

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            console.log("Validation failed: No valid questions array");
            return NextResponse.json(
                { error: "No valid questions provided!" },
                { status: 400 }
            );
        }

        // Detailed validation
        for (const q of questions) {
            if (!q.question || typeof q.question !== "string") {
                console.log("Validation failed: Invalid question", q);
                return NextResponse.json(
                    { error: "Each question must have valid question text" },
                    { status: 400 }
                );
            }
            if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                console.log("Validation failed: Invalid options", q);
                return NextResponse.json(
                    { error: "Each question must have at least 2 options" },
                    { status: 400 }
                );
            }
            if (q.correctAnswer === null || q.correctAnswer === undefined) {
                console.log("Validation failed: No correct answer", q);
                return NextResponse.json(
                    { error: "Each question must have a correct answer" },
                    { status: 400 }
                );
            }
            if (!q.classNumber || !q.subject || !q.chapterNumber || !q.chapterName) {
                console.log("Validation failed: Missing required fields", q);
                return NextResponse.json(
                    { error: "Missing required fields (classNumber, subject, chapterNumber, or chapterName)" },
                    { status: 400 }
                );
            }
        }

        console.log("Connecting to MongoDB...");
        const db = await connectMongoDB();
        if (!db) {
            console.log("Database connection failed");
            throw new Error("Database connection failed");
        }

        const mcqCollection = db.collection("mcqs");
        console.log("Inserting questions:", questions.length);

        const formattedQuestions = questions.map(q => ({
            ...q,
            classNumber: parseInt(q.classNumber, 10),
            chapterNumber: parseInt(q.chapterNumber, 10),
            createdAt: new Date()
        }));

        const result = await mcqCollection.insertMany(formattedQuestions);
        console.log("Insert result:", result);

        return NextResponse.json(
            { message: `${result.insertedCount} questions imported successfully!` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Detailed error in MCQ import:", {
            message: error.message,
            stack: error.stack,
            body: JSON.stringify(await req.json().catch(() => "Failed to parse body"))
        });
        return NextResponse.json(
            { 
                error: "Failed to import questions",
                details: error.message 
            },
            { status: 500 }
        );
    }
}