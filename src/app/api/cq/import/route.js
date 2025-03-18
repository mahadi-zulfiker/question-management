import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const body = await req.json(); // Parse the incoming JSON data
        const { questions } = body;

        if (!questions || questions.length === 0) {
            return new Response(JSON.stringify({ error: "No questions provided!" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const db = await connectMongoDB();
        const cqCollection = db.collection("cqs");

        // Insert all imported questions into the database
        const result = await cqCollection.insertMany(questions);

        return new Response(
            JSON.stringify({
                message: `${result.insertedCount} questions imported successfully!`,
            }),
            {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error importing questions:", error);
        return new Response(
            JSON.stringify({ error: "Failed to import questions." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
