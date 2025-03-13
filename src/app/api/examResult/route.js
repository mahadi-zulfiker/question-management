import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection");
    const examId = searchParams.get("examId");
    const userEmail = searchParams.get("userEmail");

    let collections = ["ExamSubmissions", "ModelTestSubmissions", "submissions"];
    if (collectionName) collections = [collectionName];

    const submissions = [];
    for (const coll of collections) {
      let query = {};
      if (examId) query.examId = examId;
      if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, "i") };

      const collectionSubmissions = await db.collection(coll).find(query).toArray();
      submissions.push(
        ...collectionSubmissions.map((sub) => ({
          ...sub,
          collection: coll,
        }))
      );
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch submissions", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const data = await request.json();
    const { id, collection, scores } = data;

    if (!id || !collection) {
      return NextResponse.json(
        { message: "Missing required fields: id or collection" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const objectId = new ObjectId(id);

    // Fetch the original submission
    const submission = await db.collection(collection).findOne({ _id: objectId });
    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Update the submission with scores
    const updateData = { scores, updatedAt: new Date() };
    const updateResult = await db.collection(collection).updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Fetch the updated submission
    const updatedSubmission = await db.collection(collection).findOne({ _id: objectId });

    // Store or update the result in ExamResults collection
    const result = {
      examId: submission.examId,
      userEmail: submission.userEmail,
      submissionId: objectId,
      title: submission.title || "Untitled Exam", // Adjust if title is available elsewhere
      totalMarks: Object.values(scores || {}).reduce((sum, score) => sum + Number(score), 0),
      maxMarks: Object.keys(submission.answers || {}).length, // Adjust based on your schema
      details: Object.entries(submission.answers || {}).reduce((acc, [key, value]) => {
        acc[key] = {
          answer: value,
          score: scores?.[key] || 0,
        };
        return acc;
      }, {}),
      evaluated: true,
      evaluatedAt: new Date(),
      updatedAt: new Date(),
    };

    // Upsert into ExamResults (update if exists, insert if not)
    await db.collection("ExamResults").updateOne(
      { submissionId: objectId },
      { $set: result },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Submission updated and results stored successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: "Failed to update submission", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const db = await connectMongoDB();
    const { id, collection } = await request.json();

    if (!id || !collection) {
      return NextResponse.json(
        { message: "Missing required fields: id or collection" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const objectId = new ObjectId(id);

    // Delete from the submission collection
    const result = await db.collection(collection).deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Delete corresponding result from ExamResults
    await db.collection("ExamResults").deleteOne({ submissionId: objectId });

    return NextResponse.json({ message: "Submission and result deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to delete submission", error: error.message },
      { status: 500 }
    );
  }
}