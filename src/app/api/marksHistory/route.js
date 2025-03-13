import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("userEmail");

    if (!userEmail) {
      return NextResponse.json({ message: "User email is required" }, { status: 400 });
    }

    const results = await db
      .collection("ExamResults")
      .find({ userEmail: { $regex: new RegExp(userEmail, "i") } })
      .sort({ evaluatedAt: -1 }) // Sort by most recent first
      .toArray();

    return NextResponse.json({ results });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch marks history", error: error.message },
      { status: 500 }
    );
  }
}