import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { packageId, paymentMethod, email } = await req.json();
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const transactionsCollection = db.collection("transactions");

        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        // Check if user already purchased the package
        const existingPurchase = await transactionsCollection.findOne({
            packageId: new ObjectId(packageId),
            email,
            status: "Success",
        });

        if (existingPurchase) {
            return NextResponse.json({ message: "Package already purchased" }, { status: 400 });
        }

        // Fetch package details
        const packageData = await packagesCollection.findOne({ _id: new ObjectId(packageId) });

        if (!packageData) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Save transaction with package details
        const transaction = {
            packageId: new ObjectId(packageId),
            email,
            packageName: packageData.name,
            amount: packageData.cost,
            paymentMethod,
            status: "Success",
            createdAt: new Date(),
        };

        await transactionsCollection.insertOne(transaction);

        return NextResponse.json({ message: "Payment Successful", transaction }, { status: 200 });
    } catch (error) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
