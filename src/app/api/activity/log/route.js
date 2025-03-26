// app/api/activity/log/route.js
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const activityData = await req.json();

    // Validate the activity data
    if (!activityData.userEmail || !activityData.action) {
      return new Response(
        JSON.stringify({ error: "userEmail and action are required" }),
        { status: 400 }
      );
    }

    const db = await connectMongoDB();
    await db.collection("user_activities").insertOne(activityData);

    return new Response(
      JSON.stringify({ message: "Activity logged successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging activity:", error);
    return new Response(
      JSON.stringify({ error: "Failed to log activity" }),
      { status: 500 }
    );
  }
}