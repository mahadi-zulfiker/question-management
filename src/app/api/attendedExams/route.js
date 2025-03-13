import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    // Normalize email to lowercase for case-insensitive matching
    const normalizedEmail = userEmail.toLowerCase();

    // Fetch all submissions for the user
    const submissions = await db
      .collection("submissions")
      .find({ userEmail: normalizedEmail })
      .toArray();

    // Fetch all exams (to attempt matching and provide fallback data)
    const exams = await db.collection("Exams").find().toArray();

    // Attempt to match submissions with exams based on examId
    const attendedExams = submissions.map((submission) => {
      const matchedExam = exams.find((exam) =>
        exam._id.toString() === submission.examId
      );
      return {
        _id: submission._id,
        examId: submission.examId,
        userEmail: submission.userEmail,
        submittedAt: submission.submittedAt,
        results: submission.results,
        examDetails: matchedExam || {
          title: "Exam Not Found",
          description: "No description available.",
          duration: "N/A",
          subject: "Unknown",
          type: "Unknown",
          classNumber: "N/A",
          chapterNumber: "N/A",
          createdAt: null,
        },
      };
    });

    // Log for debugging
    console.log("Attended exams:", attendedExams);

    return NextResponse.json({
      success: true,
      attendedExams,
    });
  } catch (error) {
    console.error("Error fetching attended exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch attended exams", details: error.message },
      { status: 500 }
    );
  }
}