import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { packageId, email } = await req.json();
        const db = await connectMongoDB();
        const transactionsCollection = db.collection("transactions");

        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        // Check if user has already purchased the package
        const existingPurchase = await transactionsCollection.findOne({
            packageId: new ObjectId(packageId),
            email,
            status: "Success",
        });

        return NextResponse.json({ alreadyPurchased: !!existingPurchase });
    } catch (error) {
        console.error("Check Purchase Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
