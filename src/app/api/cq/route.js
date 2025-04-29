import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Readable } from "stream";
import { GridFSBucket } from "mongodb";

const validContentTypes = [
  "Examples",
  "Model Tests",
  "Admission Questions",
  "Practice Problems",
  "Theory",
  "Others",
];

export async function GET(req) {
  try {
    const db = await connectMongoDB();
    const url = new URL(req.url);
    const classNumber = url.searchParams.get("classNumber");

    if (classNumber) {
      const classData = await db
        .collection("classes")
        .find({ classNumber: parseInt(classNumber) })
        .toArray();
      return NextResponse.json(classData);
    } else {
      const allClasses = await db.collection("classes").find().toArray();
      return NextResponse.json(allClasses);
    }
  } catch (error) {
    console.error("❌ Fetching Classes Failed:", error);
    return NextResponse.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const db = await connectMongoDB();
    const formData = await req.formData();

    // Extract metadata
    const classNumber = formData.get("classNumber");
    const subject = formData.get("subject");
    const subjectPaper = formData.get("subjectPaper");
    const chapterNumber = formData.get("chapterNumber");
    const chapterName = formData.get("chapterName");
    const contentType = formData.get("contentType");
    const subChapters = formData.get("subChapters");
    const cqType = formData.get("cqType");
    const teacherEmail = formData.get("teacherEmail");

    // Validate required fields
    if (
      !classNumber ||
      !subject ||
      !chapterNumber ||
      !chapterName ||
      !contentType ||
      !cqType ||
      !teacherEmail
    ) {
      return NextResponse.json(
        { error: "❌ সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন!" },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `❌ অবৈধ কন্টেন্ট টাইপ! বৈধ টাইপ: ${validContentTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Parse and validate subChapters
    let parsedSubChapters;
    try {
      parsedSubChapters = JSON.parse(subChapters);
      if (!Array.isArray(parsedSubChapters)) {
        parsedSubChapters = [];
      } else {
        parsedSubChapters = parsedSubChapters.filter(
          (sub) => typeof sub === "string" && sub.trim() !== ""
        );
      }
    } catch {
      parsedSubChapters = [];
    }

    const cqCollection = db.collection("cqs");
    const gfs = new GridFSBucket(db, { bucketName: "cqImages" });

    // Process each CQ
    const cqs = [];
    let index = 0;
    while (formData.get(`cqs[${index}][passage]`)) {
      const passage = formData.get(`cqs[${index}][passage]`);
      const questions = JSON.parse(formData.get(`cqs[${index}][questions]`));
      const answers = JSON.parse(formData.get(`cqs[${index}][answers]`));
      const image = formData.get(`cqs[${index}][image]`);
      const imageAlignment = formData.get(`cqs[${index}][imageAlignment]`);
      const videoLink = formData.get(`cqs[${index}][videoLink]`) || "";

      // Validate CQ data
      if (!passage || !Array.isArray(questions) || !Array.isArray(answers)) {
        return NextResponse.json(
          { error: `❌ CQ ${index + 1}: অসম্পূর্ণ তথ্য প্রদান করা হয়েছে!` },
          { status: 400 }
        );
      }

      // Assign marks based on cqType
      const marks = cqType === "generalCQ" ? [1, 2, 3, 4] : [3, 3, 4];

      // Handle image upload
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
        answers,
        marks,
        classNumber: parseInt(classNumber, 10),
        subject,
        subjectPaper: subjectPaper || null,
        chapterNumber: parseInt(chapterNumber, 10),
        chapterName,
        contentType,
        subChapters: parsedSubChapters,
        cqType,
        teacherEmail,
        imageId,
        imageAlignment,
        videoLink,
        createdAt: new Date(),
      });

      index++;
    }

    if (cqs.length === 0) {
      return NextResponse.json(
        { error: "❌ কোনো সৃজনশীল প্রশ্ন প্রদান করা হয়নি!" },
        { status: 400 }
      );
    }

    // Insert all CQs
    const result = await cqCollection.insertMany(cqs);

    return NextResponse.json(
      {
        message: `✅ ${cqs.length}টি সৃজনশীল প্রশ্ন সফলভাবে যোগ করা হয়েছে!`,
        insertedIds: Object.values(result.insertedIds),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CQ Insertion Error:", error);
    return NextResponse.json(
      { error: "❌ সার্ভারে সমস্যা!", details: error.message },
      { status: 500 }
    );
  }
}