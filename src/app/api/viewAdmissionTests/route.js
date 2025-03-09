import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const db = await connectMongoDB();
    const tests = await db.collection("AdmissionTests").find({}).toArray();
    return NextResponse.json({ tests }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching tests:", error);
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const db = await connectMongoDB();
    const { id, title, type, duration, classNumber, subject, chapterNumber } = await req.json();

    if (!id || !title || !type || !duration || !classNumber || !subject || !chapterNumber) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updateData = {
      title,
      type,
      duration: parseInt(duration),
      classNumber: parseInt(classNumber),
      subject,
      chapterNumber: parseInt(chapterNumber),
      updatedAt: new Date(),
    };

    const result = await db.collection("AdmissionTests").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Test not found or no changes made" }, { status: 404 });
    }

    return NextResponse.json({ message: "Test updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating test:", error);
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const db = await connectMongoDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const result = await db.collection("AdmissionTests").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Test deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("❌ Error deleting test:", error);
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 });
  }
}