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
    const {
      classNumber,
      level,
      subject,
      chapterNumber,
      chapterName,
      subjectPart,
      contentType,
      subChapters,
    } = await req.json();

    // Validate required fields
    if (!classNumber || !subject || !chapterNumber || !chapterName || !contentType) {
      return NextResponse.json(
        { message: "Missing required fields: classNumber, subject, chapterNumber, chapterName, contentType" },
        { status: 400 }
      );
    }

    // Validate chapterNumber
    if (chapterNumber <= 0) {
      return NextResponse.json(
        { message: "Chapter number must be a positive integer" },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { message: `Invalid content type. Must be one of: ${validContentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate subChapters (optional, can be empty)
    const validatedSubChapters = Array.isArray(subChapters)
      ? subChapters.filter((sub) => typeof sub === "string" && sub.trim() !== "")
      : [];

    const db = await connectMongoDB();
    const collection = db.collection("classes");
    const result = await collection.insertOne({
      classNumber,
      level: level || null,
      subject,
      chapterNumber,
      chapterName,
      subjectPart: subjectPart || "None",
      contentType,
      subChapters: validatedSubChapters,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Class created successfully", data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}