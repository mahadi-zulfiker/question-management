import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const db = await connectMongoDB();
    const body = await req.json();

    // Check if this is an exam creation or submission
    if (body.title && body.type && body.duration) {
      // Exam creation logic
      const { title, type, duration, classNumber, subject, chapterNumber, questions } = body;

      if (!title || !type || !duration || !classNumber || !subject || !chapterNumber || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "All fields and at least one question are required" }, { status: 400 });
      }

      const examData = {
        title,
        type,
        duration: parseInt(duration),
        classNumber: parseInt(classNumber),
        subject,
        chapterNumber: parseInt(chapterNumber),
        questions,
        createdAt: new Date(),
      };

      await db.collection("AdmissionTests").insertOne(examData);
      return NextResponse.json({ message: "✅ Exam created successfully" }, { status: 201 });
    } else if (body.testId && body.answers) {
      // Exam submission logic
      const { testId, answers } = body;

      if (!testId || !answers || typeof answers !== "object") {
        return NextResponse.json({ error: "Test ID and answers are required" }, { status: 400 });
      }

      const submissionData = {
        testId: new ObjectId(testId),
        answers,
        submittedAt: new Date(),
        // Optionally add userId if you have authentication: userId: new ObjectId(userId)
      };

      await db.collection("ExamSubmissions").insertOne(submissionData);
      return NextResponse.json({ message: "✅ Exam submitted successfully" }, { status: 201 });
    } else {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Database Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const db = await connectMongoDB();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type");
    const classNumber = url.searchParams.get("classNumber");
    const subject = url.searchParams.get("subject");
    const chapterNumber = url.searchParams.get("chapterNumber");

    if (id) {
      const test = await db.collection("AdmissionTests").findOne({ _id: new ObjectId(id) });
      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }
      return NextResponse.json(test, { status: 200 });
    }

    if (!type && !classNumber && !subject && !chapterNumber) {
      const tests = await db.collection("AdmissionTests").find({}).toArray();
      return NextResponse.json({ tests }, { status: 200 });
    }

    if (!type || !classNumber || !subject || !chapterNumber) {
      return NextResponse.json({ error: "All query parameters are required for questions" }, { status: 400 });
    }

    let collectionName;
    if (type === "MCQ") collectionName = "mcqs";
    else if (type === "CQ") collectionName = "cqs";
    else if (type === "SQ") collectionName = "SQ";
    else return NextResponse.json({ error: "Invalid question type" }, { status: 400 });

    let query = {};
    if (classNumber) {
      query[collectionName === "SQ" ? "classLevel" : "classNumber"] = parseInt(classNumber);
    }
    if (subject) {
      query[collectionName === "SQ" ? "subjectName" : "subject"] = subject;
    }
    if (chapterNumber) {
      query.chapterNumber = parseInt(chapterNumber);
    }

    console.log("Query:", query);
    const questions = await db.collection(collectionName).find(query).toArray();
    console.log("Questions found:", questions);

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}