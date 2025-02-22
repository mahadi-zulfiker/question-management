import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import bcrypt from "bcrypt";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "your@email.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    console.log("🔍 Received credentials:", credentials);

                    const db = await connectMongoDB(); // ✅ Fix database connection
                    console.log("✅ Connected to MongoDB");

                    // Find user
                    const user = await db.collection("users").findOne({ email: credentials.email });
                    console.log("👤 User found:", user);

                    if (!user) {
                        console.log("❌ Invalid email");
                        throw new Error("Invalid email or password");
                    }

                    // Compare passwords
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    console.log("🔐 Password match:", isValid);

                    if (!isValid) {
                        console.log("❌ Invalid password");
                        throw new Error("Invalid email or password");
                    }

                    return { id: user._id.toString(), email: user.email, userType: user.userType };
                } catch (error) {
                    console.error("❌ Authorization Error:", error);
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            console.log("📌 Session Callback - Token:", token);
            if (token) {
                session.user.id = token.id;
                session.user.userType = token.userType;
            }
            return session;
        },
        async jwt({ token, user }) {
            console.log("🛠 JWT Callback - User:", user);
            if (user) {
                token.id = user.id;
                token.userType = user.userType;
            }
            return token;
        },
    },
    pages: {
        signIn: "/signIn",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // ✅ Enable debugging
});

export { handler as GET, handler as POST };
