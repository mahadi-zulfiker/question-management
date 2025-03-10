import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb"; // Adjust path
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const modelTests = await db.collection("modelTests").find({}).toArray();
    return NextResponse.json(modelTests, { status: 200 });
  } catch (error) {
    console.error("Error fetching model tests:", error);
    return NextResponse.json({ error: "Failed to fetch model tests" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { id, name, duration, questions, class: classData, status } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (duration) updateData.duration = parseInt(duration);
    if (questions) updateData.questions = questions; // Array of { id, type }
    if (classData) updateData.class = classData; // { classNumber, subject, chapterNumber, chapterName }
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const result = await db.collection("modelTests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Model test not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Model test updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating model test:", error);
    return NextResponse.json({ error: "Failed to update model test" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = await connectMongoDB();
    const { id } = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
    }

    const result = await db.collection("modelTests").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Model test not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Model test deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting model test:", error);
    return NextResponse.json({ error: "Failed to delete model test" }, { status: 500 });
  }
}