import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

const validContentTypes = [
  "Examples",
  "Model Tests",
  "Admission Questions",
  "Practice Problems",
  "Theory",
  "Others",
];

export async function GET(req) {
  try {
    const db = await connectMongoDB();
    const url = new URL(req.url);
    const classNumber = url.searchParams.get("classNumber");

    if (classNumber) {
      const classData = await db
        .collection("classes")
        .find({ classNumber: parseInt(classNumber) })
        .toArray();
      return NextResponse.json(classData);
    } else {
      const allClasses = await db.collection("classes").find().toArray();
      return NextResponse.json(allClasses);
    }
  } catch (error) {
    console.error("❌ Fetching Classes Failed:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const db = await connectMongoDB();
    const body = await req.json();

    // Extract values
    const {
      question,
      options,
      correctAnswer,
      classNumber,
      subject,
      chapterNumber,
      chapterName,
      subjectPaper,
      contentType,
      subChapters,
      teacherEmail,
      questionType,
    } = body;

    // Validate required fields
    if (
      !question ||
      !Array.isArray(options) ||
      options.length < 2 ||
      correctAnswer === null ||
      correctAnswer < 0 ||
      correctAnswer >= options.length ||
      !classNumber ||
      !subject ||
      !chapterNumber ||
      !chapterName ||
      !contentType ||
      !questionType ||
      !teacherEmail
    ) {
      return NextResponse.json(
        {
          error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!",
          details: body,
        },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `❌ অবৈধ কন্টেন্ট টাইপ! বৈধ টাইপ: ${validContentTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate subChapters
    const validatedSubChapters = Array.isArray(subChapters)
      ? subChapters.filter((sub) => typeof sub === "string" && sub.trim() !== "")
      : [];

    const mcqCollection = db.collection("mcqs");

    const newMCQ = {
      question,
      options,
      correctAnswer,
      classNumber: parseInt(classNumber, 10),
      subject,
      chapterNumber: parseInt(chapterNumber, 10),
      chapterName,
      subjectPaper: subjectPaper || null,
      contentType,
      subChapters: validatedSubChapters,
      questionType,
      teacherEmail,
      createdAt: new Date(),
    };

    const result = await mcqCollection.insertOne(newMCQ);

    return NextResponse.json(
      {
        message: "✅ এমসিকিউ সফলভাবে তৈরি হয়েছে!",
        mcq: { _id: result.insertedId, ...newMCQ },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Server Error:", error);
    return NextResponse.json(
      { error: "❌ সার্ভারে সমস্যা!", details: error.message },
      { status: 500 }
    );
  }
}