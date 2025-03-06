import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { classNumber, level, subject, chapterNumber, chapterName, subjectPart } = await req.json();
    if (!classNumber || !subject || !chapterNumber || !chapterName) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const db = await connectMongoDB();
    const collection = db.collection("classes");
    const result = await collection.insertOne({
      classNumber,
      level,
      subject,
      chapterNumber, // Store separately
      chapterName, // Store separately
      subjectPart: subjectPart || "None",
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Class created successfully", data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
