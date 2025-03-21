
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { 
      questionClass, 
      department, 
      subject, 
      testNumber, 
      answers, 
      userEmail, // Changed from userId to userEmail
      duration 
    } = body;

    const submission = {
      userEmail, // Store email instead of ObjectId
      questionClass: Number(questionClass), // Ensure it's a number
      department: department || "N/A",
      subject,
      testNumber,
      answers,
      startTime: new Date(),
      duration,
      submittedAt: null,
      autoSubmitted: false,
      score: null
    };

    const result = await db.collection("modelTestSubmissions").insertOne(submission);

    return NextResponse.json({
      success: true,
      submissionId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { submissionId, answers, autoSubmit = false } = body;

    const updateData = {
      answers,
      submittedAt: new Date(),
      autoSubmitted: autoSubmit
    };

    const result = await db.collection("modelTestSubmissions").findOneAndUpdate(
      { _id: new ObjectId(submissionId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      submission: result.value
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}



export async function GET() {
  try {
    const db = await connectMongoDB();
    const modelTests = await db.collection("modelTest").find().toArray();
    const classes = await db.collection("classes").find().toArray();
    
    return NextResponse.json({
      modelTests,
      classes
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST and PUT endpoints remain unchanged...