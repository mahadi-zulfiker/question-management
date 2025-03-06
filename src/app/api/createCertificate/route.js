import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const fetchStudents = url.searchParams.get("students");

        const db = await connectMongoDB();
        if (fetchStudents === "true") {
            const students = await db.collection("users").find({ userType: "Student" }).toArray();
            return NextResponse.json(students, { status: 200 });
        }
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const { studentId, title, description, dateIssued, signature } = await req.json();

        if (!studentId || !title || !dateIssued || !signature) {
            return NextResponse.json({ error: "Missing required fields (studentId, title, dateIssued, signature)" }, { status: 400 });
        }

        if (!ObjectId.isValid(studentId)) {
            return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const student = await db.collection("users").findOne({ _id: new ObjectId(studentId), userType: "Student" });
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        const certificate = {
            studentId: new ObjectId(studentId),
            studentEmail: student.email,
            studentName: student.username,
            title,
            description: description || "",
            dateIssued: new Date(dateIssued),
            signature, // New field for teacher's signature
            createdAt: new Date(),
            issued: false,
        };

        const result = await db.collection("certificates").insertOne(certificate);
        return NextResponse.json({ message: "Certificate created", id: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("Error creating certificate:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { certificateId } = await req.json();
        if (!certificateId || !ObjectId.isValid(certificateId)) {
            return NextResponse.json({ error: "Valid certificate ID required" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const result = await db.collection("certificates").updateOne(
            { _id: new ObjectId(certificateId) },
            { $set: { issued: true } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Certificate issued to student" }, { status: 200 });
    } catch (error) {
        console.error("Error issuing certificate:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}