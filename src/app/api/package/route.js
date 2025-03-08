import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const { name, cost, validity, description, benefits } = await req.json();

        // Validate input
        if (!name || !cost || !validity || !description || !benefits) {
            return NextResponse.json(
                { message: "All fields are required", details: { name, cost, validity, description, benefits } },
                { status: 400 }
            );
        }
        if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
            return NextResponse.json({ message: "Cost must be a valid positive number" }, { status: 400 });
        }

        const newPackage = {
            name,
            cost: parseFloat(cost),
            validity,
            description,
            benefits,
            createdAt: new Date(),
        };

        const result = await packagesCollection.insertOne(newPackage);
        return NextResponse.json(
            { message: "Package created successfully", packageId: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating package:", error.message);
        return NextResponse.json(
            { message: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const packages = await packagesCollection.find({}).sort({ createdAt: -1 }).toArray(); // Sort by newest first
        return NextResponse.json(packages, { status: 200 });
    } catch (error) {
        console.error("Error fetching packages:", error.message);
        return NextResponse.json(
            { message: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}