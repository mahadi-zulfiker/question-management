import { connectMongoDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await connectMongoDB();
    const moderators = await db.collection("users").find({ userType: "Moderator" }).toArray();

    const sanitizedModerators = moderators.map(({ password, ...rest }) => ({
      ...rest,
      id: rest._id.toString(),
    }));

    return new Response(JSON.stringify(sanitizedModerators), { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/morderators:", error);
    return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
  }
}