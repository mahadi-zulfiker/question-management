import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const { name, cost, validity, description, benefits } = await req.json();

        // Validate input
        if (!name || !cost || !validity || !description || !benefits) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        // Insert package into the database
        const newPackage = {
            name,
            cost: parseFloat(cost),
            validity,
            description,
            benefits,
            createdAt: new Date(),
        };
        
        const result = await packagesCollection.insertOne(newPackage);
        return NextResponse.json({ message: "Package created successfully", packageId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error("Error creating package:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const packages = await packagesCollection.find({}).toArray();
        return NextResponse.json(packages, { status: 200 });
    } catch (error) {
        console.error("Error fetching packages:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
