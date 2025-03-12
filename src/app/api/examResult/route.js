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
    if (collectionName) {
      collections = [collectionName];
    }

    const submissions = [];
    for (const coll of collections) {
      let query = {};
      if (examId) {
        query.examId = examId;
      }
      if (userEmail) {
        query.userEmail = { $regex: new RegExp(userEmail, "i") };
      }

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

    console.log("PUT Request Data:", { id, collection, scores });

    if (!id || !collection) {
      return NextResponse.json(
        { message: "Missing required fields: id or collection" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      console.error("Invalid ID format:", id);
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const updateData = {};
    if (scores) {
      updateData["scores"] = scores;
    }
    updateData.updatedAt = new Date();

    const objectId = new ObjectId(id);
    console.log("Querying for:", { _id: objectId, collection });

    // First, update the document
    const updateResult = await db
      .collection(collection)
      .updateOne({ _id: objectId }, { $set: updateData });

    if (updateResult.matchedCount === 0) {
      console.log("No document matched for update:", { _id: objectId, collection });
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Fetch the updated document
    const updatedDoc = await db
      .collection(collection)
      .findOne({ _id: objectId });

    if (!updatedDoc) {
      console.log("Updated document not found after update:", { _id: objectId, collection });
      return NextResponse.json({ message: "Submission not found after update" }, { status: 404 });
    }

    console.log("Updated submission:", updatedDoc);
    return NextResponse.json({
      message: "Submission updated successfully",
      submission: updatedDoc,
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

    const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Failed to delete submission", error: error.message },
      { status: 500 }
    );
  }
}