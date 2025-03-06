import { connectMongoDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";

export async function GET(req) {
    try {
        const session = await getServerSession(req);
        if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const { email } = session.user;
        const db = await connectMongoDB();
        const teacher = await db.collection("users").findOne({ email, userType: "Teacher" });

        if (!teacher) {
            return new Response(JSON.stringify({ error: "Teacher profile not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, teacher }), { status: 200 });
    } catch (error) {
        console.error("GET Error:", error);
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(req);
        if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const { email } = session.user;
        const { username, institute, experience, bio } = await req.json();
        const db = await connectMongoDB();

        const updatedTeacher = await db.collection("users").findOneAndUpdate(
            { email, userType: "Teacher" },
            { $set: { username, institute, experience, bio } },
            { returnDocument: "after" }
        );

        return new Response(JSON.stringify({ success: true, teacher: updatedTeacher.value }), { status: 200 });
    } catch (error) {
        console.error("PUT Error:", error);
        return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500 });
    }
}
