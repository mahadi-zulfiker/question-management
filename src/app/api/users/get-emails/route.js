// app/api/users/get-emails/route.js
import { connectMongoDB } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";

export async function GET(req) {
  try {
    // Check if the user is the admin
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.email !== "admin123@gmail.com") {
      return new Response(
        JSON.stringify({ error: "Access denied. Admins only." }),
        { status: 403 }
      );
    }

    const db = await connectMongoDB();
    const users = await db
      .collection("users")
      .find({}, { projection: { email: 1, _id: 0 } }) // Only fetch the email field
      .toArray();

    const emails = users.map((user) => user.email);

    return new Response(JSON.stringify(emails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user emails:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user emails" }),
      { status: 500 }
    );
  }
}