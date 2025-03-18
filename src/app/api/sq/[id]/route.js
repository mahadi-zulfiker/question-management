import { ObjectId } from "mongodb";
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export async function PUT(req, { params }) {
    try {
        console.log("🔧 PUT request received with params:", params);

        const id = params?.id;
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        delete body._id; // Prevent MongoDB _id modification

        const db = await connectMongoDB();
        const sqCollection = db.collection("SQ");

        const result = await sqCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: body }
        );

        console.log("🔄 MongoDB Update Result:", result);

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "SQ not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "SQ updated successfully!" }, { status: 200 });
    } catch (error) {
        console.error("🚨 Error updating SQ:", error);
        return NextResponse.json({ error: "Failed to update SQ" }, { status: 500 });
    }
}

export async function DELETE(req, context) {
    try {
        const id = context.params.id || req.nextUrl.pathname.split("/").pop();
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const db = await connectMongoDB();
        if (!db) {
            return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
        }
        const sqCollection = db.collection("SQ");
        const objectId = new ObjectId(id);
        const found = await sqCollection.findOne({ _id: objectId });
        if (!found) {
            return NextResponse.json({ error: "MCQ not found in database" }, { status: 404 });
        }
        const result = await sqCollection.deleteOne({ _id: objectId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "MCQ not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "MCQ deleted successfully!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete MCQ" }, { status: 500 });
    }
}