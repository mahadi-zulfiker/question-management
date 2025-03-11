import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectMongoDB();
    const prices = await db.collection("priceSettings").findOne({});

    if (!prices) {
      return NextResponse.json({ message: "No price settings found", prices: null }, { status: 404 });
    }

    return NextResponse.json({ message: "Prices fetched successfully", prices }, { status: 200 });
  } catch (error) {
    console.error("Error fetching prices:", error);
    return NextResponse.json({ message: "Error fetching prices", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const {
      teacherMCQ,
      teacherCQ,
      teacherSQ,
      teacherModelTest,
      teacherAdmissionTest,
      studentMCQ,
      studentCQ,
      studentSQ,
      studentModelTest,
      studentAdmissionTest,
    } = await request.json();

    const priceData = {
      teacherMCQ: parseFloat(teacherMCQ) || 0,
      teacherCQ: parseFloat(teacherCQ) || 0,
      teacherSQ: parseFloat(teacherSQ) || 0,
      teacherModelTest: parseFloat(teacherModelTest) || 0,
      teacherAdmissionTest: parseFloat(teacherAdmissionTest) || 0,
      studentMCQ: parseFloat(studentMCQ) || 0,
      studentCQ: parseFloat(studentCQ) || 0,
      studentSQ: parseFloat(studentSQ) || 0,
      studentModelTest: parseFloat(studentModelTest) || 0,
      studentAdmissionTest: parseFloat(studentAdmissionTest) || 0,
      updatedAt: new Date(),
    };

    const result = await db.collection("priceSettings").updateOne(
      {},
      { $set: priceData },
      { upsert: true }
    );

    if (result.acknowledged) {
      return NextResponse.json({ message: "Prices updated successfully", prices: priceData }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to update prices" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating prices:", error);
    return NextResponse.json({ message: "Error updating prices", error: error.message }, { status: 500 });
  }
}