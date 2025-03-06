import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const db = await connectMongoDB();
        const certificates = await db.collection("certificates").find().toArray();
        return NextResponse.json(certificates, { status: 200 });
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { certificateId, title, description, signature, dateIssued } = await req.json();

        if (!certificateId || !ObjectId.isValid(certificateId)) {
            return NextResponse.json({ error: "Valid certificate ID required" }, { status: 400 });
        }

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (signature) updateFields.signature = signature;
        if (dateIssued) updateFields.dateIssued = new Date(dateIssued);

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const result = await db.collection("certificates").updateOne(
            { _id: new ObjectId(certificateId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Certificate updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating certificate:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { certificateId } = await req.json();

        if (!certificateId || !ObjectId.isValid(certificateId)) {
            return NextResponse.json({ error: "Valid certificate ID required" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const result = await db.collection("certificates").deleteOne({ _id: new ObjectId(certificateId) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Certificate deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting certificate:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}