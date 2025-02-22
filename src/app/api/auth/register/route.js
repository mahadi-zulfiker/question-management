import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    console.log("➡️ Register API Called");

    const body = await req.json();
    console.log("📩 Received data:", body);

    if (!body.username || !body.email || !body.password) {
      console.log("❌ Missing Fields");
      return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
    }

    const db = await connectMongoDB();
    console.log("✅ Connected to MongoDB");

    const existingUser = await db.collection("users").findOne({ email: body.email });
    if (existingUser) {
      console.log("⚠️ User already exists");
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    console.log("🔐 Password hashed");

    const result = await db.collection("users").insertOne({
      username: body.username,
      email: body.email,
      password: hashedPassword,
      userType: body.userType || "Student",
      createdAt: new Date(),
    });

    console.log("✅ User inserted:", result);

    return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
  }
}


