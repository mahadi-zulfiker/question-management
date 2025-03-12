// app/api/studentGuardian/route.js
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const db = await connectMongoDB();
    const guardians = await db.collection("guardians").find().toArray();
    return NextResponse.json({ guardians });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch guardians", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const db = await connectMongoDB();
    const data = await request.json();

    const guardian = {
      id: uuidv4(),
      ...data,
      createdAt: new Date(),
    };

    await db.collection("guardians").insertOne(guardian);

    return NextResponse.json(
      { message: "Guardian added successfully", guardian },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to add guardian", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const data = await request.json();
    const { id, ...updateData } = data;

    const result = await db.collection("guardians").findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ message: "Guardian not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Guardian updated successfully",
      guardian: result.value,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update guardian", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const db = await connectMongoDB();
    const { id } = await request.json();

    const result = await db.collection("guardians").deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Guardian not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Guardian deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete guardian", error: error.message },
      { status: 500 }
    );
  }
}