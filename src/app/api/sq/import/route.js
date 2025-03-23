import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";

export async function POST(req) {
    try {
        const formData = await req.formData();
        console.log("Received form data entries:", [...formData.entries()]);

        const db = await connectMongoDB();
        const sqCollection = db.collection("SQ");
        const gfs = new GridFSBucket(db, { bucketName: "sqImages" });

        // Common fields
        const classLevel = formData.get("classLevel");
        const subjectName = formData.get("subjectName");
        const subjectPart = formData.get("subjectPart") || null;
        const chapterNumber = formData.get("chapterNumber");
        const chapterName = formData.get("chapterName");
        const teacherEmail = formData.get("teacherEmail");

        if (!classLevel || !subjectName || !chapterNumber || !chapterName || !teacherEmail) {
            return NextResponse.json(
                { error: "Missing required common fields" },
                { status: 400 }
            );
        }

        const sqs = [];
        let index = 0;
        while (formData.get(`sqs[${index}][type]`)) {
            const type = formData.get(`sqs[${index}][type]`);
            const question = formData.get(`sqs[${index}][question]`);
            const answer = formData.get(`sqs[${index}][answer]`) || "";
            const image = formData.get(`sqs[${index}][image]`);
            const imageAlignment = formData.get(`sqs[${index}][imageAlignment]`) || "center";
            const videoLink = formData.get(`sqs[${index}][videoLink]`) || "";

            if (!type || !question) {
                return NextResponse.json(
                    { error: `Invalid data for SQ ${index + 1}` },
                    { status: 400 }
                );
            }

            let imageId = null;
            if (image && image.size > 0) {
                const readableImageStream = new Readable();
                readableImageStream.push(Buffer.from(await image.arrayBuffer()));
                readableImageStream.push(null);

                const uploadStream = gfs.openUploadStream(image.name, {
                    contentType: image.type,
                });

                await new Promise((resolve, reject) => {
                    readableImageStream.pipe(uploadStream);
                    uploadStream.on("finish", () => {
                        imageId = uploadStream.id;
                        resolve();
                    });
                    uploadStream.on("error", reject);
                });
            }

            sqs.push({
                type,
                question, // Stored as HTML string
                answer,   // Stored as HTML string
                classLevel: parseInt(classLevel, 10),
                subjectName,
                subjectPart,
                chapterNumber: parseInt(chapterNumber, 10),
                chapterName,
                teacherEmail,
                imageId,
                imageAlignment,
                videoLink,
                createdAt: new Date(),
            });

            index++;
        }

        if (sqs.length === 0) {
            return NextResponse.json(
                { error: "No valid SQs provided" },
                { status: 400 }
            );
        }

        const result = await sqCollection.insertMany(sqs);
        return NextResponse.json(
            { message: `${result.insertedCount} questions imported successfully!` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error importing SQs:", error);
        return NextResponse.json(
            { error: "Failed to import questions", details: error.message },
            { status: 500 }
        );
    }
}