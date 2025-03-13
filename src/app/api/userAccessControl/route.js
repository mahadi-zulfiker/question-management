// /api/userAccessControl/route.js
import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const db = await connectMongoDB();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "fetchSubjectsPartsChapters") {
      const collections = ["questionBanks", "SQ", "cqs", "mcqs"];
      const subjectsPartsChapters = {};

      for (const collection of collections) {
        const items = await db.collection(collection).find({}).toArray();
        console.log(`Fetching from ${collection}:`, items.length, "items found");
        subjectsPartsChapters[collection] = {
          subjects: [...new Set(items.map((item) => item.subject))].filter(Boolean),
          parts: [...new Set(items.map((item) => item.part))].filter(Boolean),
          chapters: [...new Set(items.map((item) => item.chapter))].filter(Boolean),
        };
        console.log(`Data for ${collection}:`, subjectsPartsChapters[collection]);
      }

      return NextResponse.json({ subjectsPartsChapters });
    } else {
      const users = await db.collection("users").find({}).toArray();
      const transactions = await db.collection("transactions").find({}).toArray();

      const userMetrics = await Promise.all(
        users.map(async (user) => {
          const userTransactions = transactions.filter((t) => t.userInfo?.email === user.email);
          const totalPaid = userTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

          let suggestedAccess = {};
          if (totalPaid >= 1000) {
            suggestedAccess = {
              questionBanks: { subjects: ["Math", "Science"], parts: ["Part A", "Part B"], chapters: ["Chapter 1", "Chapter 2"] },
              SQ: { subjects: ["Math", "Science"], parts: ["Part A"], chapters: ["Chapter 1"] },
              cqs: { subjects: ["Math"], parts: [], chapters: [] },
              mcqs: { subjects: ["Science"], parts: [], chapters: [] },
            };
          } else if (totalPaid >= 500) {
            suggestedAccess = {
              questionBanks: { subjects: ["Math"], parts: ["Part A"], chapters: ["Chapter 1"] },
              SQ: { subjects: ["Science"], parts: [], chapters: [] },
              cqs: { subjects: [], parts: [], chapters: [] },
              mcqs: { subjects: [], parts: [], chapters: [] },
            };
          } else {
            suggestedAccess = {
              questionBanks: { subjects: [], parts: [], chapters: [] },
              SQ: { subjects: [], parts: [], chapters: [] },
              cqs: { subjects: [], parts: [], chapters: [] },
              mcqs: { subjects: [], parts: [], chapters: [] },
            };
          }

          return {
            ...user,
            totalPaid,
            transactionCount: userTransactions.length,
            suggestedAccess,
            access: user.access || {},
          };
        })
      );

      return NextResponse.json({ users: userMetrics });
    }
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const db = await connectMongoDB();
    const { userId, access } = await request.json();

    console.log("Received PUT request:", { userId, access }); // Debug log

    if (!userId || !access) {
      return NextResponse.json(
        { message: "Missing required fields: userId or access" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }

    // Validate access structure
    const validCollections = ["questionBanks", "SQ", "cqs", "mcqs"];
    for (const collection in access) {
      if (!validCollections.includes(collection)) {
        return NextResponse.json(
          { message: `Invalid collection: ${collection}` },
          { status: 400 }
        );
      }
      const fields = access[collection];
      if (
        !Array.isArray(fields.subjects) ||
        !Array.isArray(fields.parts) ||
        !Array.isArray(fields.chapters)
      ) {
        return NextResponse.json(
          { message: `Invalid access format for ${collection}` },
          { status: 400 }
        );
      }
    }

    const objectId = new ObjectId(userId);
    const updateResult = await db.collection("users").updateOne(
      { _id: objectId },
      { $set: { access, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("Update successful for user:", userId); // Debug log
    return NextResponse.json({ message: "User access updated successfully" });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { message: "Failed to update user access", error: error.message },
      { status: 500 }
    );
  }
}