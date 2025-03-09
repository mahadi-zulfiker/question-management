import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { packageId, questionBankId, paymentMethod, email, userInfo } = await req.json();
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const questionBanksCollection = db.collection("questionBanks");
        const transactionsCollection = db.collection("transactions");

        // Validate input
        if ((!packageId && !questionBankId) || !paymentMethod || !email || !userInfo) {
            return NextResponse.json(
                { message: "Missing required fields: packageId or questionBankId, paymentMethod, email, or userInfo" },
                { status: 400 }
            );
        }

        const id = packageId || questionBankId;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
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

        // Determine the collection and field to check
        const collection = packageId ? packagesCollection : questionBanksCollection;
        const idField = packageId ? "packageId" : "questionBankId";

        // Check if user already purchased the item
        const existingPurchase = await transactionsCollection.findOne({
            [idField]: new ObjectId(id),
            email,
            status: "Success",
        });

        if (existingPurchase) {
            return NextResponse.json(
                { message: `${packageId ? "Package" : "Question Bank"} already purchased`, transactionId: existingPurchase._id },
                { status: 400 }
            );
        }

        // Fetch item details
        const itemData = await collection.findOne({ _id: new ObjectId(id) });
        if (!itemData) {
            return NextResponse.json(
                { message: `${packageId ? "Package" : "Question Bank"} not found` },
                { status: 404 }
            );
        }

        // Simulate payment processing
        const paymentStatus = "Success"; // Replace with actual payment gateway logic

        // Save transaction with item details and user info
        const transaction = {
            [idField]: new ObjectId(id),
            email,
            userInfo: {
                name,
                phoneNumber,
                email,
            },
            itemName: itemData.name,
            amount: itemData.price || itemData.cost, // Use price for questionBanks, cost for packages
            paymentMethod,
            status: paymentStatus,
            createdAt: new Date(),
            type: packageId ? "package" : "questionBank", // Differentiate type
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