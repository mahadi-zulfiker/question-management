import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("❌ MONGODB_URI is not defined in .env");

let client;
let clientPromise;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectMongoDB() {
  try {
    console.log("🛠 Connecting to MongoDB...");
    const client = await clientPromise;
    console.log("✅ MongoDB Connected Successfully!");
    const db = client.db("Question");
    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
