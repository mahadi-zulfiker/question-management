import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.username || !body.email || !body.password || !body.userType) {
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    const db = await connectMongoDB();
    const existingUser = await db.collection("users").findOne({ email: body.email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Determine subscription cost for Students
    let subscriptionCost = "N/A";
    if (body.userType === "Student") {
      subscriptionCost = body.subscriptionType === "yearly" ? "2000৳" : "200৳";
    }

    const user = {
      username: body.username,
      email: body.email,
      password: hashedPassword,
      userType: body.userType,
      subscriptionType: body.userType === "Student" ? body.subscriptionType || "monthly" : "N/A",
      subscriptionCost: subscriptionCost,
      institutionName: body.userType === "Teacher" ? body.institutionName || "" : "N/A",
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(user);
    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
  }
}
