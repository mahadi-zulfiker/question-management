import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";

export async function POST(req) {
    try {
        const formData = await req.formData();
        console.log("Received form data entries:", [...formData.entries()]);

        const db = await connectMongoDB();
        const mcqCollection = db.collection("mcqs");
        const gfs = new GridFSBucket(db, { bucketName: "mcqImages" });

        // Common fields
        const classNumber = formData.get("classNumber");
        const subject = formData.get("subject");
        const subjectPart = formData.get("subjectPart") || null;
        const chapterNumber = formData.get("chapterNumber");
        const chapterName = formData.get("chapterName");
        const questionType = formData.get("questionType");
        const teacherEmail = formData.get("teacherEmail");

        if (!classNumber || !subject || !chapterNumber || !chapterName || !questionType || !teacherEmail) {
            return NextResponse.json(
                { error: "Missing required common fields" },
                { status: 400 }
            );
        }

        const questions = [];
        let index = 0;
        while (formData.get(`questions[${index}][question]`)) {
            const question = formData.get(`questions[${index}][question]`);
            const options = JSON.parse(formData.get(`questions[${index}][options]`));
            const correctAnswer = formData.get(`questions[${index}][correctAnswer]`);
            const image = formData.get(`questions[${index}][image]`);

            if (!question || !options || !Array.isArray(options) || correctAnswer === null) {
                return NextResponse.json(
                    { error: `Invalid data for question ${index + 1}` },
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

            questions.push({
                question,
                options,
                correctAnswer: parseInt(correctAnswer, 10),
                classNumber: parseInt(classNumber, 10),
                subject,
                subjectPart,
                chapterNumber: parseInt(chapterNumber, 10),
                chapterName,
                questionType,
                teacherEmail,
                imageId,
                createdAt: new Date()
            });

            index++;
        }

        if (questions.length === 0) {
            return NextResponse.json(
                { error: "No valid questions provided" },
                { status: 400 }
            );
        }

        const result = await mcqCollection.insertMany(questions);
        return NextResponse.json(
            { message: `${result.insertedCount} questions imported successfully!` },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error importing MCQs:", error);
        return NextResponse.json(
            { error: "Failed to import questions", details: error.message },
            { status: 500 }
        );
    }
}