// app/api/activity/get/route.js
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const skip = (page - 1) * limit;

    const db = await connectMongoDB();
    let query = {};
    if (email) {
      query.userEmail = email;
    }
    if (start || end) {
      query.timestamp = {};
      if (start) query.timestamp.$gte = new Date(start).toISOString();
      if (end) query.timestamp.$lte = new Date(new Date(end).setHours(23, 59, 59, 999)).toISOString();
    }

    const totalActivities = await db
      .collection("user_activities")
      .countDocuments(query);

    const activities = await db
      .collection("user_activities")
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalActivities / limit);

    return new Response(
      JSON.stringify({
        activities,
        totalPages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch activities" }),
      { status: 500 }
    );
  }
}