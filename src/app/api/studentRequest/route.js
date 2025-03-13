import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { studentId, teacherId, studentEmail, teacherEmail, message, requestType } = await request.json();

    if (!studentId || !teacherId || !requestType) {
      return NextResponse.json(
        { error: "Student ID, Teacher ID, and request type are required" },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const requestData = {
      studentId,
      teacherId,
      studentEmail: studentEmail || "unknown@example.com",
      teacherEmail: teacherEmail || "unknown@example.com",
      message: message || "Request to join course or circle",
      requestType, // "studentToTeacher" or "teacherToStudent"
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("studentRequests").insertOne(requestData);

    return NextResponse.json({
      success: true,
      message: "Request created successfully",
      requestId: result.insertedId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const teacherId = searchParams.get("teacherId");

    const db = await connectMongoDB();
    let query = { status: "pending" }; // Only fetch pending requests
    if (studentId) query.studentId = studentId;
    if (teacherId) query.teacherId = teacherId;

    const requests = await db.collection("studentRequests").find(query).toArray();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { requestId, status, circleId } = await request.json();
    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();

    // Fetch the request to get studentId
    const existingRequest = await db.collection("studentRequests").findOne({ _id: new ObjectId(requestId) });
    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // If approved, add student to circle (for studentToTeacher requests)
    if (status === "approved" && circleId && existingRequest.requestType === "studentToTeacher") {
      if (!ObjectId.isValid(circleId)) {
        console.error("Invalid circleId:", circleId);
        return NextResponse.json({ error: "Invalid circle ID" }, { status: 400 });
      }

      console.log("Adding student", existingRequest.studentId, "to circle", circleId);
      const circleUpdateResult = await db.collection("circles").updateOne(
        { _id: new ObjectId(circleId) },
        { $addToSet: { studentIds: existingRequest.studentId } }
      );

      if (circleUpdateResult.matchedCount === 0) {
        console.error("Circle not found for ID:", circleId);
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }

      console.log("Circle update result:", circleUpdateResult);
    }

    // Delete the request from the database after processing
    console.log("Deleting request with ID:", requestId, "after setting status to:", status);
    const deleteResult = await db.collection("studentRequests").deleteOne({ _id: new ObjectId(requestId) });

    if (deleteResult.deletedCount === 0) {
      console.error("Request not found for deletion, ID:", requestId);
      return NextResponse.json({ error: "Request not found for deletion" }, { status: 404 });
    }

    return NextResponse.json({ message: "Request processed and deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request", details: error.message },
      { status: 500 }
    );
  }
}