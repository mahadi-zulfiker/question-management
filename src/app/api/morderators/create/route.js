import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.email || !body.password) {
      return new Response(JSON.stringify({ message: "Email and password are required" }), { status: 400 });
    }

    const db = await connectMongoDB();
    const existingUser = await db.collection("users").findOne({ email: body.email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "Moderator already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const session = await getServerSession(); // Optional: for createdBy field
    const moderator = {
      email: body.email,
      password: hashedPassword,
      userType: "Moderator",
      username: body.email.split("@")[0],
      subscriptionType: "N/A",
      subscriptionCost: "N/A",
      institutionName: "N/A",
      createdAt: new Date(),
      createdBy: session?.user?.id || "anonymous", // Fallback to "anonymous" if no session
    };

    await db.collection("users").insertOne(moderator);
    return new Response(JSON.stringify({ message: "Moderator created successfully" }), { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/morderators/create:", error);
    return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
  }
}