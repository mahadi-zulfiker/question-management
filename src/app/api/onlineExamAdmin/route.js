import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

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

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { questionClass, department, subject, testNumber, questions } = body;
    
    const modelTest = await db.collection("modelTest");
    const result = await modelTest.insertOne({
      questionClass: Number(questionClass), // Ensure it's stored as a number
      department: department || "N/A",
      subject,
      testNumber,
      questions,
      createdAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      testId: result.insertedId
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}