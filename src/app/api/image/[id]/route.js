// app/api/image/[id]/route.js
import { connectMongoDB } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const type = url.searchParams.get("type"); // e.g., "mcq", "cq", "sq"
        const id = params.id;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Determine the bucket based on the type
        let bucketName;
        switch (type) {
            case "mcq":
                bucketName = "mcqImages";
                break;
            case "cq":
                bucketName = "cqImages";
                break;
            case "sq":
                bucketName = "sqImages";
                break;
            default:
                // Try all buckets if type is not specified
                bucketName = ["mcqImages", "cqImages", "sqImages"];
        }

        const objectId = new ObjectId(id);

        if (Array.isArray(bucketName)) {
            // Check all buckets if type is not specified
            for (const name of bucketName) {
                const gfs = new GridFSBucket(db, { bucketName: name });
                const files = await gfs.find({ _id: objectId }).toArray();
                if (files.length > 0) {
                    const stream = gfs.openDownloadStream(objectId);
                    return new NextResponse(stream, {
                        headers: {
                            "Content-Type": files[0].contentType || "image/jpeg",
                            "Content-Length": files[0].length.toString(),
                        },
                    });
                }
            }
            return NextResponse.json({ error: "Image not found in any bucket" }, { status: 404 });
        } else {
            // Use specific bucket
            const gfs = new GridFSBucket(db, { bucketName });
            const files = await gfs.find({ _id: objectId }).toArray();
            if (!files || files.length === 0) {
                return NextResponse.json({ error: `Image not found in ${bucketName}` }, { status: 404 });
            }

            const file = files[0];
            const stream = gfs.openDownloadStream(objectId);
            return new NextResponse(stream, {
                headers: {
                    "Content-Type": file.contentType || "image/jpeg",
                    "Content-Length": file.length.toString(),
                },
            });
        }
    } catch (error) {
        console.error("Error serving image:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}