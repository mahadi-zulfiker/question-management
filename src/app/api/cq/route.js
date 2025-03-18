import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const formData = await req.formData(); // Parse form data

        // Extract values from form data
        const passage = formData.get("passage");
        const questions = JSON.parse(formData.get("questions"));
        const classNumber = formData.get("classNumber");
        const division = formData.get("division");
        const subject = formData.get("subject");
        const subjectPart = formData.get("subjectPart");
        const chapterNumber = formData.get("chapterNumber");
        const chapterName = formData.get("chapterName");
        const teacherEmail = formData.get("teacherEmail");
        const image = formData.get("image"); // File object

        // Validate required fields
        if (!teacherEmail || !passage || !classNumber || !subject || !chapterNumber || !chapterName) {
            return NextResponse.json(
                { error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" },
                { status: 400 }
            );
        }

        // Prepare the image for GridFS if provided
        let imageId = null;
        if (image) {
            const readableImageStream = new Readable();
            readableImageStream.push(Buffer.from(await image.arrayBuffer()));
            readableImageStream.push(null);

            const gfs = new GridFSBucket(db, { bucketName: "cqImages" });

            const uploadStream = gfs.openUploadStream(image.name, {
                contentType: image.type,
            });

            await new Promise((resolve, reject) => {
                readableImageStream.pipe(uploadStream);
                uploadStream.on("finish", () => {
                    imageId = uploadStream.id; // Store file ID for referencing the image later
                    resolve();
                });
                uploadStream.on("error", (error) => {
                    console.error("Image Upload Error:", error);
                    reject(error);
                });
            });
        }

        // Assigning marks dynamically
        const marks = [1, 2, 3, 4];

        const cqCollection = db.collection("cqs");

        const newCQ = {
            passage,
            questions,
            marks,
            classNumber: parseInt(classNumber, 10),
            division: division || null,
            subject,
            subjectPart: subjectPart || null,
            chapterNumber: parseInt(chapterNumber, 10),
            chapterName,
            teacherEmail,
            imageId, // Reference to uploaded image in GridFS
            createdAt: new Date(),
        };

        const result = await cqCollection.insertOne(newCQ);

        return NextResponse.json(
            { message: "✅ CQ সফলভাবে যোগ করা হয়েছে!", cq: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error("CQ Insertion Error:", error);
        return NextResponse.json(
            { error: "❌ সার্ভারে সমস্যা হয়েছে!" },
            { status: 500 }
        );
    }
}


export async function GET(req) {
    try {
        const db = await connectMongoDB();
        const url = new URL(req.url);
        const classNumber = url.searchParams.get("classNumber");

        if (classNumber) {
            const classData = await db.collection("classes").find({ classNumber: parseInt(classNumber, 10) }).toArray();
            return NextResponse.json(classData);
        } else {
            const allClasses = await db.collection("classes").find().toArray();
            return NextResponse.json(allClasses);
        }
    } catch (error) {
        console.error("❌ Fetching Classes Failed:", error);
        return NextResponse.json({ error: "Server Error", details: error.message }, { status: 500 });
    }
}