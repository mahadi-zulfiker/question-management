import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch circles or students
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const fetchStudents = url.searchParams.get("students");

    const db = await connectMongoDB();
    if (fetchStudents === "true") {
      const students = await db
        .collection("users")
        .find({ userType: "Student", _id: { $exists: true, $ne: null } })
        .toArray();
      return NextResponse.json(students, { status: 200 });
    } else {
      const circles = await db.collection("circles").find().toArray();
      // Fetch all student IDs to validate
      const studentIds = await db
        .collection("users")
        .find({ userType: "Student" }, { projection: { _id: 1 } })
        .toArray()
        .then((students) => students.map((s) => s._id.toString()));

      // Sanitize circles.studentIds
      const sanitizedCircles = circles.map((circle) => ({
        ...circle,
        studentIds: circle.studentIds?.filter(
          (id) => id && typeof id === "string" && studentIds.includes(id)
        ) || [],
      }));

      return NextResponse.json(sanitizedCircles, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// POST: Create a new circle
export async function POST(req) {
  try {
    const { circleName } = await req.json();
    if (!circleName) {
      return NextResponse.json({ error: "Circle name is required" }, { status: 400 });
    }

    const db = await connectMongoDB();
    const result = await db.collection("circles").insertOne({
      circleName,
      studentIds: [],
      createdAt: new Date(),
    });
    return NextResponse.json({ message: "Circle created successfully", id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating circle:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// DELETE: Delete a circle
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid circle ID" }, { status: 400 });
    }

    const db = await connectMongoDB();
    const result = await db.collection("circles").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Circle deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting circle:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}

// PATCH: Update circle (name or studentIds)
export async function PATCH(req) {
  try {
    const { id, circleName, action, studentId } = await req.json();
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid circle ID" }, { status: 400 });
    }

    const db = await connectMongoDB();
    const updateQuery = {};

    if (circleName) {
      updateQuery.circleName = circleName;
    }

    if (action === "add" && studentId) {
      if (!ObjectId.isValid(studentId)) {
        return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
      }
      updateQuery.$addToSet = { studentIds: studentId };
    } else if (action === "remove" && studentId) {
      if (!ObjectId.isValid(studentId)) {
        return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
      }
      updateQuery.$pull = { studentIds: studentId };
    }

    if (Object.keys(updateQuery).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const updateOperation = updateQuery.$addToSet || updateQuery.$pull ? updateQuery : { $set: updateQuery };
    const result = await db.collection("circles").updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Circle updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating circle:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}