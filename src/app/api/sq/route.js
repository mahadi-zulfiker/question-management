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

export async function POST(req) {
  try {
    const db = await connectMongoDB();
    const {
      type,
      question,
      classLevel,
      subjectName,
      subjectPaper,
      chapterNumber,
      contentType,
      subChapters,
      teacherEmail,
    } = await req.json();

    // Validate required fields
    if (!type || !question || !classLevel || !subjectName || !chapterNumber || !contentType) {
      return NextResponse.json(
        { error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন! (টাইপ, প্রশ্ন, ক্লাস, বিষয়, অধ্যায় নম্বর, কন্টেন্ট টাইপ)" },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `❌ অবৈধ কন্টেন্ট টাইপ! বৈধ টাইপ: ${validContentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate chapterNumber
    if (isNaN(chapterNumber) || chapterNumber <= 0) {
      return NextResponse.json(
        { error: "❌ অধ্যায় নম্বর অবশ্যই ধনাত্মক সংখ্যা হতে হবে!" },
        { status: 400 }
      );
    }

    // Validate subChapters (optional, can be empty)
    const validatedSubChapters = Array.isArray(subChapters)
      ? subChapters.filter((sub) => typeof sub === "string" && sub.trim() !== "")
      : [];

    const collection = db.collection("SQ");
    const newSQ = {
      type,
      question,
      classLevel: parseInt(classLevel, 10),
      subjectName,
      subjectPaper: subjectPaper || null,
      chapterNumber: parseInt(chapterNumber, 10),
      contentType,
      subChapters: validatedSubChapters,
      teacherEmail: teacherEmail || null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newSQ);
    return NextResponse.json(
      { message: "✅ সংক্ষিপ্ত প্রশ্ন সফলভাবে যোগ করা হয়েছে!", sq: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("SQ Insertion Error:", error);
    return NextResponse.json(
      { error: "❌ সার্ভারে সমস্যা হয়েছে!" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const db = await connectMongoDB();
    const url = new URL(req.url);
    const classNumber = url.searchParams.get("classNumber");

    if (classNumber) {
      const classData = await db
        .collection("classes")
        .find({ classNumber: parseInt(classNumber, 10) })
        .toArray();
      return NextResponse.json(classData);
    } else {
      const allClasses = await db.collection("classes").distinct("classNumber");
      return NextResponse.json(allClasses.map((classNumber) => ({ classNumber })));
    }
  } catch (error) {
    console.error("❌ Fetching Classes Failed:", error);
    return NextResponse.json(
      { error: "❌ সার্ভারে সমস্যা হয়েছে!", details: error.message },
      { status: 500 }
    );
  }
}