import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    // Fetch prices
    const prices = await db.collection("priceSettings").findOne({});
    if (!prices) {
      return NextResponse.json({ message: "No price settings found", prices: null, users: [] }, { status: 404 });
    }

    // Fetch user data
    let users = [];
    if (email) {
      // Case-insensitive partial match for email
      const regex = new RegExp(email, "i");
      users = await db.collection("users").find({ email: regex }).toArray();
    } else {
      users = await db.collection("users").find().toArray(); // Fetch all users for initial load
    }

    return NextResponse.json({ message: "Data fetched successfully", prices, users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ message: "Error fetching data", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const { 
      teacherMCQ, teacherCQ, teacherSQ, teacherModelTest, teacherAdmissionTest,
      studentMCQ, studentCQ, studentSQ, studentModelTest, studentAdmissionTest,
      discounts
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

    if (discounts && discounts.length > 0) {
      const bulkOps = discounts.map(({ email, discount }) => ({
        updateOne: {
          filter: { email },
          update: { $set: { discount: parseFloat(discount) || 0 } }, // Stored as percentage
          upsert: true,
        },
      }));
      await db.collection("users").bulkWrite(bulkOps);
    }

    if (result.acknowledged) {
      return NextResponse.json({ message: "Prices and discounts updated successfully", prices: priceData }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to update prices" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating prices or discounts:", error);
    return NextResponse.json({ message: "Error updating data", error: error.message }, { status: 500 });
  }
}