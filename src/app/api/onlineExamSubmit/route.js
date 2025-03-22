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
      userEmail,
      duration 
    } = body;

    const submission = {
      userEmail,
      questionClass: Number(questionClass),
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

    // Fetch the submission to get exam details
    const submission = await db.collection("modelTestSubmissions").findOne({ _id: new ObjectId(submissionId) });
    if (!submission) throw new Error("Submission not found");

    // Fetch the corresponding model test to get correct answers
    const modelTest = await db.collection("modelTest").findOne({
      questionClass: submission.questionClass,
      department: submission.department,
      subject: submission.subject,
      testNumber: submission.testNumber
    });

    if (!modelTest) throw new Error("Model test not found");

    // Calculate score
    let score = 0;
    modelTest.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correctAnswer;
      if (userAnswer !== undefined && userAnswer === correctAnswer) {
        score += 1;
      }
    });

    const updateData = {
      answers,
      submittedAt: new Date(),
      autoSubmitted: autoSubmit,
      score: score // Store the calculated score
    };

    const result = await db.collection("modelTestSubmissions").findOneAndUpdate(
      { _id: new ObjectId(submissionId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      submission: result.value,
      totalQuestions: modelTest.questions.length,
      score: score
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