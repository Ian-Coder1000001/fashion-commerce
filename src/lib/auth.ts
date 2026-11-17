import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";
import {
  authenticateWithCredentials,
  findOrCreateGoogleUser,
} from "@/services/auth.service";
import { loginRateLimit, getClientIp } from "@/lib/rate-limit";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

// Google only switches on once both values exist, so deploying this code
// before the keys are added can never break the rest of the login system.
const googleEnabled = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Full NextAuth instance for the Node.js runtime. Providers that need
 * mongoose or bcrypt live here, never in proxy.ts (Edge runtime). See
 * auth.config.ts for the edge-safe base used by route protection.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const ip = await getClientIp();
        const { success } = await loginRateLimit.limit(ip);
        if (!success) {
          // Returning null (not throwing) deliberately shows the same
          // generic "invalid credentials" message a wrong password
          // would: never reveal that rate limiting blocked an attacker.
          return null;
        }

        const user = await authenticateWithCredentials(email, password);
        return user;
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      // Only trust an email Google itself says is verified.
      if (!profile?.email || profile.email_verified !== true) return false;

      const result = await findOrCreateGoogleUser(profile.email, profile.name ?? "");
      return result.ok;
    },

    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        // For Google, the id on `user` is Google's own, not ours, so
        // always take the id and role from our database.
        await connectToDatabase();
        const dbUser = await User.findOne({
          email: profile.email.toLowerCase(),
        })
          .select("role")
          .lean();
        if (dbUser) {
          token.id = String(dbUser._id);
          token.role = dbUser.role;
        }
        return token;
      }

      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }
      return token;
    },
  },
});