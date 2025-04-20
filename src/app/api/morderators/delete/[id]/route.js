import { connectMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "Invalid moderator ID" }), { status: 400 });
    }

    const db = await connectMongoDB();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id), userType: "Moderator" });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "Moderator not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Moderator deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/morderators/delete:", error);
    return new Response(JSON.stringify({ message: "Something went wrong", error: error.message }), { status: 500 });
  }
}