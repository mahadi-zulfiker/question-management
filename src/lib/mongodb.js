import { MongoClient } from "mongodb";

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in .env");
}

// Declare client and clientPromise variables
let client;
let clientPromise;

// Handle connection based on environment
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect().then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    return client;
  }).catch(error => {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("Failed to connect to MongoDB");
  });
}

clientPromise = global._mongoClientPromise;

// Export the connection function
export async function connectMongoDB() {
  const client = await clientPromise;
  return client.db("Question"); // Use your database name
}

// Optional: Export a function to close the connection (useful for cleanup)
export async function closeMongoDB() {
  if (client) {
    await client.close();
    console.log("🔒 MongoDB Connection Closed");
  }
}
