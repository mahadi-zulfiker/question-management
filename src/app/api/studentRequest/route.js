import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const { studentId, teacherId, message, studentEmail } = await request.json();

    if (!studentId || !teacherId) {
      return NextResponse.json(
        { error: "Student ID and Teacher ID are required" },
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    const requestData = {
      studentId,
      teacherId,
      studentEmail: studentEmail || "unknown@example.com", // Fallback if email not provided
      message: message || "Student request to join course",
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
    console.error("Error creating student request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const db = await connectMongoDB();
    const requests = await db
      .collection("studentRequests")
      .find(studentId ? { studentId } : {})
      .toArray();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}