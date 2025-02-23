import NextAuth from "next-auth";
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
                    const { email, password } = credentials;

                    if (!email || !password) {
                        throw new Error("Email and password are required");
                    }

                    const db = await connectMongoDB();
                    const user = await db.collection("users").findOne({ email });

                    if (!user) {
                        throw new Error("Invalid email or password");
                    }

                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) {
                        throw new Error("Invalid email or password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        userType: user.userType,
                        subscriptionType: user.subscriptionType,
                        institutionName: user.institutionName || "N/A",
                    };
                } catch (error) {
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.userType = token.userType;
                session.user.subscriptionType = token.subscriptionType;
                session.user.institutionName = token.institutionName;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.userType = user.userType;
                token.subscriptionType = user.subscriptionType;
                token.institutionName = user.institutionName;
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
    debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };