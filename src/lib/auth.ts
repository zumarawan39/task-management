import { Types } from "mongoose";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models/User";

const githubId = process.env.GITHUB_ID;
const githubSecret = process.env.GITHUB_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        await connectDB();
        const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
        if (!user?.passwordHash) return null;
        const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!matches) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
    ...(githubId && githubSecret ? [GitHub({ clientId: githubId, clientSecret: githubSecret })] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "github") return true;
      if (!user.email) return false;
      await connectDB();
      const email = user.email.toLowerCase();
      const githubAccountId = account.providerAccountId;
      const existing = await User.findOne({ $or: [{ githubId: githubAccountId }, { email }] });
      const doc =
        existing ??
        (await User.create({
          email,
          name: user.name ?? email,
          githubId: githubAccountId,
        }));
      if (!doc.githubId) {
        doc.githubId = githubAccountId;
        await doc.save();
      }
      user.id = doc._id.toString();
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
});

export function isObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}
