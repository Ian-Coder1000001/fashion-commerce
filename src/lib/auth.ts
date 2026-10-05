import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { authenticateWithCredentials } from "@/services/auth.service";
import { loginRateLimit, getClientIp } from "@/lib/rate-limit";

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
          // would — never reveal to an attacker that rate limiting is
          // what blocked them.
          return null;
        }

        const user = await authenticateWithCredentials(email, password);
        return user;
      },
    }),
  ],
});