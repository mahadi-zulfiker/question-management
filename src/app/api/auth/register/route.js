import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
    try {
        const body = await req.json();
        const { username, email, password, userType, subscriptionType, institutionName } = body;

        // Validate required fields
        if (!username || !email || !password || !userType) {
            return new Response(JSON.stringify({ message: "All fields are required" }), { status: 400 });
        }

        const db = await connectMongoDB();

        // Check if user already exists
        const existingUser = await db.collection("users").findOne({ email });
        if (existingUser) {
            return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user object with dynamic fields
        const user = {
            username,
            email,
            password: hashedPassword,
            userType,
            subscriptionType: userType === "Student" ? subscriptionType || "monthly" : "N/A",
            institutionName: userType === "Teacher" ? institutionName || "" : "N/A",
            createdAt: new Date(),
        };

        await db.collection("users").insertOne(user);

        return new Response(JSON.stringify({ message: "User registered successfully" }), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
    }
}