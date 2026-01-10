import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("NextAuth authorize function called with:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        // Static credentials for demo purposes
        if (credentials.email === "admin_thinkcyber@gmail.com" && credentials.password === "admin123") {
          console.log("Credentials match, returning user");
          return {
            id: "1",
            email: credentials.email,
            name: "Admin User"
          };
        }

        console.log("Invalid credentials");
        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour in seconds
  },
  secret: "6b7f8e2c9a1d4e5f3c2b8a7d9e0f1c4b",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  jwt: {
    maxAge: 60 * 60, // 1 hour in seconds
  },
};
