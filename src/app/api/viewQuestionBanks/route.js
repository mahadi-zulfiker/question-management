import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb"; // Adjust path
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const questionBanks = await db.collection("questionBanks").find({}).toArray();
    return NextResponse.json(questionBanks, { status: 200 });
  } catch (error) {
    console.error("Error fetching question banks:", error);
    return NextResponse.json({ error: "Failed to fetch question banks" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const body = await request.json();
    const { id, name, validity, description, price, questions, class: classData, status } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (validity) updateData.validity = new Date(validity); // Ensure date format
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (questions) updateData.questions = questions; // Array of question objects
    if (classData) updateData.class = { ...classData, classNumber: parseInt(classData.classNumber), chapterNumber: parseInt(classData.chapterNumber) };
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const result = await db.collection("questionBanks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Question bank not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Question bank updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating question bank:", error);
    return NextResponse.json({ error: "Failed to update question bank" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const db = await connectMongoDB();
    const { id } = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID is required" }, { status: 400 });
    }

    const result = await db.collection("questionBanks").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Question bank not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Question bank deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting question bank:", error);
    return NextResponse.json({ error: "Failed to delete question bank" }, { status: 500 });
  }
}