import { connectMongoDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";

export async function GET(req) {
    try {
        const session = await getServerSession(req);
        if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const { email } = session.user;
        const db = await connectMongoDB();
        const student = await db.collection("users").findOne({ email, userType: "Student" });

        if (!student) {
            return new Response(JSON.stringify({ error: "Student profile not found" }), { status: 404 });
        }

        return new Response(JSON.stringify({ success: true, student }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(req);
        if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

        const { email } = session.user;
        const { username, institute, degree, bio, skills } = await req.json();
        const db = await connectMongoDB();

        const updatedStudent = await db.collection("users").findOneAndUpdate(
            { email, userType: "Student" },
            { $set: { username, institute, degree, bio, skills } },
            { returnDocument: "after" }
        );

        return new Response(JSON.stringify({ success: true, student: updatedStudent.value }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to update profile" }), { status: 500 });
    }
}
