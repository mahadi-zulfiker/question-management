// /api/exam/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const db = await connectMongoDB();
    const { title, type, duration, classNumber, subject, chapterNumber, questions } = await req.json();

    // Validate required fields
    if (
      !title ||
      !type ||
      !duration ||
      !classNumber ||
      !subject ||
      !chapterNumber ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return NextResponse.json({ error: "All fields and at least one question are required" }, { status: 400 });
    }

    // Validate exam type
    if (!["MCQ", "CQ", "SQ"].includes(type)) {
      return NextResponse.json({ error: "Invalid exam type" }, { status: 400 });
    }

    // Validate numeric fields
    const parsedDuration = parseInt(duration);
    const parsedClassNumber = parseInt(classNumber);
    const parsedChapterNumber = parseInt(chapterNumber);
    if (
      isNaN(parsedDuration) ||
      parsedDuration <= 0 ||
      isNaN(parsedClassNumber) ||
      parsedClassNumber <= 0 ||
      isNaN(parsedChapterNumber) ||
      parsedChapterNumber <= 0
    ) {
      return NextResponse.json(
        { error: "Duration, class number, and chapter number must be positive integers" },
        { status: 400 }
      );
    }

    // Validate questions based on type
    for (const q of questions) {
      if (!q._id) {
        return NextResponse.json({ error: "Each question must have an _id" }, { status: 400 });
      }
      if (type === "MCQ" && (!q.question || !Array.isArray(q.options) || q.options.length < 2)) {
        return NextResponse.json(
          { error: "MCQ questions must have a question and at least 2 options" },
          { status: 400 }
        );
      }
      if (type === "CQ" && (!q.passage || !Array.isArray(q.questions) || q.questions.length === 0)) {
        return NextResponse.json(
          { error: "CQ questions must have a passage and at least one sub-question" },
          { status: 400 }
        );
      }
      if (type === "SQ" && !q.question) {
        return NextResponse.json({ error: "SQ questions must have a question" }, { status: 400 });
      }
    }

    // Deduplicate questions by _id
    const uniqueQuestions = Array.from(new Map(questions.map((q) => [q._id, q])).values());
    if (uniqueQuestions.length !== questions.length) {
      return NextResponse.json({ error: "Duplicate question IDs found" }, { status: 400 });
    }

    const examData = {
      title,
      type,
      duration: parsedDuration,
      classNumber: parsedClassNumber,
      subject,
      chapterNumber: parsedChapterNumber,
      questions: uniqueQuestions,
      createdAt: new Date(),
    };

    const collection = db.collection("Exams");
    await collection.insertOne(examData);
    return NextResponse.json({ message: "✅ Exam created successfully" }, { status: 201 });
  } catch (error) {
    console.error("❌ Database Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}