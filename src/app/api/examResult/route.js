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

    const examCollections = ["Exams", "AdmissionTests", "modelTests"];
    const submissions = [];
    for (const coll of collections) {
      let query = {};
      if (examId) query.examId = examId;
      if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, "i") };

      const collectionSubmissions = await db.collection(coll).find(query).toArray();
      for (const sub of collectionSubmissions) {
        let examQuestions = [];
        for (const examColl of examCollections) {
          const exam = await db.collection(examColl).findOne({ _id: new ObjectId(sub.examId) });
          if (exam && exam.questions) {
            examQuestions = exam.questions.map((q) => ({
              _id: q._id.toString(),
              question: q.question,
              marks: q.marks || 1,
            }));
            break;
          }
        }

        const achievedMarks = sub.scores
          ? Object.values(sub.scores).reduce((sum, score) => sum + Number(score), 0)
          : 0;

        const collectionDisplayName = {
          ExamSubmissions: "Admission Exams",
          ModelTestSubmissions: "Model Tests",
          submissions: "Regular Exams",
        }[coll] || coll;

        const submissionData = {
          ...sub,
          collection: collectionDisplayName,
          totalMarks: 100,
          achievedMarks,
          questions: examQuestions,
          normalizedAnswers: Object.entries(sub.answers || {}).reduce((acc, [qId, answer]) => {
            const question = examQuestions.find((q) => q._id === qId);
            acc[qId] = {
              question: question ? question.question : `Question ID: ${qId}`,
              answer: answer || "N/A",
              marks: question ? question.marks : 1,
            };
            return acc;
          }, {}),
        };
        console.log(`Submission for ${sub.userEmail}:`, submissionData);
        submissions.push(submissionData);
      }
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

    // Map display name to internal collection name
    const collectionMap = {
      "Admission Exams": "ExamSubmissions",
      "Model Tests": "ModelTestSubmissions",
      "Regular Exams": "submissions",
    };
    const internalCollection = collectionMap[collection] || collection;

    const submission = await db.collection(internalCollection).findOne({ _id: objectId });
    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    let examQuestions = [];
    const examCollections = ["Exams", "AdmissionTests", "modelTests"];
    for (const examColl of examCollections) {
      const exam = await db.collection(examColl).findOne({ _id: new ObjectId(submission.examId) });
      if (exam && exam.questions) {
        examQuestions = exam.questions.map((q) => ({
          _id: q._id.toString(),
          marks: q.marks || 1,
        }));
        break;
      }
    }

    const maxMarksPerQuestion = examQuestions.reduce((acc, q) => {
      acc[q._id] = q.marks;
      return acc;
    }, {});
    const totalSubmittedMarks = Object.values(scores || {}).reduce((sum, score) => sum + Number(score), 0);
    if (totalSubmittedMarks > 100) {
      return NextResponse.json(
        { message: "Total marks cannot exceed 100" },
        { status: 400 }
      );
    }

    for (const [questionId, score] of Object.entries(scores || {})) {
      const maxMarks = maxMarksPerQuestion[questionId] || 1;
      if (score > maxMarks) {
        return NextResponse.json(
          { message: `Score for question ${questionId} exceeds max marks (${maxMarks})` },
          { status: 400 }
        );
      }
    }

    const updateData = { scores, updatedAt: new Date() };
    const updateResult = await db.collection(internalCollection).updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    const updatedSubmission = await db.collection(internalCollection).findOne({ _id: objectId });

    const result = {
      examId: submission.examId,
      userEmail: submission.userEmail,
      submissionId: objectId,
      title: submission.title || "Untitled Exam",
      totalMarks: 100,
      achievedMarks: totalSubmittedMarks,
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