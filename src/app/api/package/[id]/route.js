import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
    try {
        const { id } = params;
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid package ID" }, { status: 400 });
        }

        const db = await connectMongoDB();
        const packagesCollection = db.collection("packages");
        const packageData = await packagesCollection.findOne({ _id: new ObjectId(id) });

        if (!packageData) {
            return NextResponse.json({ message: "Package not found" }, { status: 404 });
        }

        return NextResponse.json(packageData, { status: 200 });
    } catch (error) {
        console.error("Fetch Package Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
