import { connectMongoDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";

const ADMIN_EMAIL = "admin123@gmail.com"; // Define the admin email

export async function GET(req) {
  const session = await getServerSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userType = session.user.userType;
  const userEmail = session.user.email;

  try {
    const db = await connectMongoDB();
    let messages = [];

    if (userType === "Admin") {
      messages = await db
        .collection("messages")
        .find({
          $or: [
            { recipientEmail: ADMIN_EMAIL },
            { senderEmail: ADMIN_EMAIL },
          ],
        })
        .sort({ timestamp: -1 })
        .toArray();

      const groupedMessages = messages.reduce((acc, msg) => {
        const otherEmail = msg.senderEmail === ADMIN_EMAIL ? msg.recipientEmail : msg.senderEmail;
        if (otherEmail && otherEmail !== ADMIN_EMAIL) {
          if (!acc[otherEmail]) acc[otherEmail] = [];
          acc[otherEmail].push(msg);
        }
        return acc;
      }, {});
      console.log("Grouped messages for Admin (before response):", groupedMessages); // Debug log
      return new Response(JSON.stringify(groupedMessages), { status: 200 });
    } else {
      messages = await db
        .collection("messages")
        .find({
          $or: [
            { senderEmail: userEmail },
            { recipientEmail: userEmail },
          ],
        })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();
      console.log(`Messages for ${userType || "Unknown"} (Email: ${userEmail}):`, messages);
      return new Response(JSON.stringify(messages), { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let userType = session.user.userType;
  const userEmail = session.user.email;

  console.log("Session data in POST:", { userType, userEmail });

  // Fallback: Look up userType if missing
  if (!userType && userEmail) {
    const db = await connectMongoDB();
    const user = await db.collection("users").findOne({ email: userEmail });
    userType = user?.userType || "Unknown";
    console.log("Looked up userType from database:", userType);
  }

  try {
    const db = await connectMongoDB();
    const payload = await req.json();
    console.log("Raw payload received:", payload);

    if (userType === "Admin") {
      const { text, recipientEmail } = payload;
      console.log("POST payload for Admin (destructured):", { text, recipientEmail });

      if (!recipientEmail) {
        console.error("Recipient email is missing in payload");
        return new Response(JSON.stringify({ error: "Recipient email is required" }), { status: 400 });
      }

      if (recipientEmail === ADMIN_EMAIL) {
        console.error("Invalid recipient email: Cannot send to self", recipientEmail);
        return new Response(JSON.stringify({ error: "Cannot send message to self" }), { status: 400 });
      }

      const newMessage = {
        text,
        sender: "Admin",
        senderEmail: ADMIN_EMAIL,
        recipientEmail,
        timestamp: new Date(),
        isAutomated: false,
      };

      console.log("New message to be inserted:", newMessage);
      const result = await db.collection("messages").insertOne(newMessage);
      console.log("Message inserted with ID:", result.insertedId);
      return new Response(JSON.stringify({ message: "Message sent" }), { status: 200 });
    } else {
      const { text } = payload;
      let sender = userType || "Unknown";
      if (!userType && userEmail) {
        const user = await db.collection("users").findOne({ email: userEmail });
        sender = user?.userType || "Unknown";
      }

      const newMessage = {
        text,
        sender,
        senderEmail: userEmail,
        recipientEmail: ADMIN_EMAIL,
        timestamp: new Date(),
        isAutomated: false,
      };

      const existingMessages = await db
        .collection("messages")
        .find({ senderEmail: userEmail, sender, isAutomated: false })
        .toArray();

      await db.collection("messages").insertOne(newMessage);

      const automatedReplies = {
        Teacher: [
          "Hello! How can I assist you with your class today?",
          "Do you need help with scheduling or assignments?",
        ],
        Student: [
          "Hi there! How can I help you with your studies?",
          "Are you looking for resources or homework assistance?",
        ],
      };

      if (existingMessages.length === 0 && automatedReplies[sender]) {
        console.log(`Sending automated reply for ${sender} (Email: ${userEmail})`);
        const replyText = automatedReplies[sender][Math.floor(Math.random() * automatedReplies[sender].length)];
        const automatedResponse = {
          text: replyText,
          sender: "Bot",
          senderEmail: "bot@example.com",
          recipientEmail: userEmail,
          timestamp: new Date(),
          isAutomated: true,
        };
        await db.collection("messages").insertOne(automatedResponse);
        console.log("Automated reply sent:", replyText);
      } else {
        console.log(`No automated reply sent for ${sender} (Email: ${userEmail}). Existing messages: ${existingMessages.length}`);
      }

      return new Response(JSON.stringify({ message: "Message sent" }), { status: 200 });
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500 });
  }
}