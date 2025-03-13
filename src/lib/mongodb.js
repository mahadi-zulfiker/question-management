import { MongoClient } from "mongodb";

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in .env");
}

// MongoDB client options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Declare client and clientPromise variables
let client;
let clientPromise;

// Handle connection based on environment
if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export the connection function
export async function connectMongoDB() {
  try {
    console.log("🛠 Connecting to MongoDB...");
    const client = await clientPromise;
    console.log("✅ MongoDB Connected Successfully!");
    const db = client.db("Question"); // Use your database name
    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}

// Optional: Export a function to close the connection (useful for cleanup)
export async function closeMongoDB() {
  if (client) {
    await client.close();
    console.log("🔒 MongoDB Connection Closed");
  }
}