import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { packageId, paymentMethod } = await req.json();
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const transactionsCollection = db.collection("transactions"); // New collection for storing transactions

        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        const packageData = await packagesCollection.findOne({ _id: new ObjectId(packageId) });

        if (!packageData) {
            return NextResponse.json({ message: "Invalid package" }, { status: 400 });
        }

        // Create a transaction entry
        const transaction = {
            packageId: new ObjectId(packageId),
            packageName: packageData.name,
            paymentMethod,
            amount: packageData.cost,
            status: "Success",
            createdAt: new Date(),
        };

        // Insert into transactions collection
        const result = await transactionsCollection.insertOne(transaction);

        if (!result.acknowledged) {
            return NextResponse.json({ message: "Failed to save transaction" }, { status: 500 });
        }

        return NextResponse.json({ message: "Payment Successful", transaction }, { status: 200 });
    } catch (error) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
