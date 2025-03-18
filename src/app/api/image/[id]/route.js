import { connectMongoDB } from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const db = await connectMongoDB();

        // Get the imageId from the URL
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid image ID" },
                { status: 400 }
            );
        }

        const gfs = new GridFSBucket(db, { bucketName: "cqImages" });

        // Open a download stream from GridFS
        const downloadStream = gfs.openDownloadStream(new ObjectId(id));

        // Stream the image as a response
        return new Response(downloadStream, {
            headers: {
                "Content-Type": "image/jpeg", // Replace with appropriate MIME type
                "Cache-Control": "max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error retrieving image:", error);
        return NextResponse.json(
            { error: "Failed to retrieve image" },
            { status: 500 }
        );
    }
}
