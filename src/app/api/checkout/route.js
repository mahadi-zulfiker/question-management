import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { packageId, paymentMethod, email, userInfo } = await req.json();
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const transactionsCollection = db.collection("transactions");

        // Validate input
        if (!packageId || !paymentMethod || !email || !userInfo) {
            return NextResponse.json(
                { message: "Missing required fields: packageId, paymentMethod, email, or userInfo" },
                { status: 400 }
            );
        }

        if (!ObjectId.isValid(packageId)) {
            return NextResponse.json({ message: "Invalid package ID format" }, { status: 400 });
        }

        // Validate userInfo fields
        const { name, phoneNumber } = userInfo;
        if (!name || !phoneNumber || !email) {
            return NextResponse.json(
                { message: "Missing required userInfo fields: name, phoneNumber, or email" },
                { status: 400 }
            );
        }

        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ message: "Invalid email format" }, { status: 400 });
        }

        // Validate payment method
        const validPaymentMethods = ["বিকাশ", "Question Management"];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return NextResponse.json({ message: "Invalid payment method" }, { status: 400 });
        }

        // Check if user already purchased the package
        const existingPurchase = await transactionsCollection.findOne({
            packageId: new ObjectId(packageId),
            email,
            status: "Success",
        });

        if (existingPurchase) {
            return NextResponse.json(
                { message: "Package already purchased", transactionId: existingPurchase._id },
                { status: 400 }
            );
        }

        // Fetch package details
        const packageData = await packagesCollection.findOne({ _id: new ObjectId(packageId) });
        if (!packageData) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        // Simulate payment processing (e.g., call to payment gateway)
        const paymentStatus = "Success"; // In a real scenario, this would come from the payment gateway

        // Save transaction with package details and user info
        const transaction = {
            packageId: new ObjectId(packageId),
            email,
            userInfo: {
                name,
                phoneNumber,
                email,
            },
            packageName: packageData.name,
            amount: packageData.cost,
            paymentMethod,
            status: paymentStatus,
            createdAt: new Date(),
        };

        const result = await transactionsCollection.insertOne(transaction);

        if (paymentStatus !== "Success") {
            return NextResponse.json({ message: "Payment failed" }, { status: 500 });
        }

        return NextResponse.json(
            {
                message: "Payment Successful",
                transactionId: result.insertedId,
                transaction,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Checkout Error:", error.message);
        return NextResponse.json(
            { message: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}