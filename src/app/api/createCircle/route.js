import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { circleName, studentIds } = await req.json();
        if (!circleName || !studentIds || !Array.isArray(studentIds)) {
            return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const result = await db.collection("circles").insertOne({ circleName, studentIds, createdAt: new Date() });

        return NextResponse.json({ message: "Circle created successfully", circle: result }, { status: 201 });
    } catch (error) {
        console.error("Error creating circle:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await connectMongoDB();
        const students = await db.collection("users").find({ userType: "Student" }).toArray();
        return NextResponse.json(students, { status: 200 });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}