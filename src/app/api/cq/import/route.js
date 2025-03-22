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
            const questionsStr = formData.get(`cqs[${index}][questions]`);
            const answersStr = formData.get(`cqs[${index}][answers]`);
            const image = formData.get(`cqs[${index}][image]`);
            const imageAlignment = formData.get(`cqs[${index}][imageAlignment]`) || "center";

            if (!passage || !questionsStr) {
                return NextResponse.json(
                    { error: `Invalid data for CQ ${index + 1}: missing passage or questions` },
                    { status: 400 }
                );
            }

            let questions;
            let answers = [];
            try {
                questions = JSON.parse(questionsStr);
                if (answersStr) {
                    answers = JSON.parse(answersStr);
                }
            } catch (error) {
                return NextResponse.json(
                    { error: `Invalid JSON for CQ ${index + 1}: ${error.message}` },
                    { status: 400 }
                );
            }

            if (!Array.isArray(questions) || questions.length === 0) {
                return NextResponse.json(
                    { error: `Questions must be a non-empty array for CQ ${index + 1}` },
                    { status: 400 }
                );
            }

            // Pad answers array to match questions length, filling with empty strings if necessary
            const paddedAnswers = Array(questions.length).fill("");
            if (Array.isArray(answers)) {
                answers.forEach((answer, i) => {
                    if (i < questions.length) paddedAnswers[i] = answer || "";
                });
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

            cqs.push({
                passage,
                questions,
                answers: paddedAnswers,
                marks: cqType === "generalCQ" ? [1, 2, 3, 4] : [3, 3, 4],
                classNumber: parseInt(classNumber, 10),
                subject,
                subjectPart,
                chapterNumber: parseInt(chapterNumber, 10),
                chapterName,
                teacherEmail,
                imageId,
                imageAlignment,
                createdAt: new Date(),
                cqType,
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