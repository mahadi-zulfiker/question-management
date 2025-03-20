import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";

export async function POST(req) {
    try {
        const formData = await req.formData();
        console.log("Received form data entries:", [...formData.entries()]);

        const db = await connectMongoDB();
        const cqCollection = db.collection("cqs");
        const gfs = new GridFSBucket(db, { bucketName: "cqImages" });

        // Common fields
        const classNumber = formData.get("classNumber");
        const subject = formData.get("subject");
        const subjectPart = formData.get("subjectPart") || null;
        const chapterNumber = formData.get("chapterNumber");
        const chapterName = formData.get("chapterName");
        const teacherEmail = formData.get("teacherEmail");
        const cqType = formData.get("cqType");

        if (!classNumber || !subject || !chapterNumber || !chapterName || !teacherEmail || !cqType) {
            return NextResponse.json(
                { error: "Missing required common fields" },
                { status: 400 }
            );
        }

        const cqs = [];
        let index = 0;
        while (formData.get(`cqs[${index}][passage]`)) {
            const passage = formData.get(`cqs[${index}][passage]`);
            const questions = JSON.parse(formData.get(`cqs[${index}][questions]`));
            const image = formData.get(`cqs[${index}][image]`);

            if (!passage || !questions || !Array.isArray(questions)) {
                return NextResponse.json(
                    { error: `Invalid data for CQ ${index + 1}` },
                    { status: 400 }
                );
            }

            let imageId = null;
            if (image && image.size > 0) {  // Check if image exists and has content
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

            cqs.push({
                passage,
                questions,
                marks: cqType === "generalCQ" ? [1, 2, 3, 4] : [2, 3, 4],
                classNumber: parseInt(classNumber, 10),
                subject,
                subjectPart,
                chapterNumber: parseInt(chapterNumber, 10),
                chapterName,
                teacherEmail,
                imageId,
                createdAt: new Date(),
                cqType
            });

            index++;
        }

        if (cqs.length === 0) {
            return NextResponse.json(
                { error: "No valid CQs provided" },
                { status: 400 }
            );
        }

        const result = await cqCollection.insertMany(cqs);
        return NextResponse.json(
            { message: `${result.insertedCount} questions imported successfully!` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error importing CQs:", error);
        return NextResponse.json(
            { error: "Failed to import questions", details: error.message },
            { status: 500 }
        );
    }
}