import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config. This file must NEVER import anything that
 * touches Node-only APIs (bcrypt, mongoose, etc) because it's loaded by
 * proxy.ts, which runs in the Edge runtime. Providers that need
 * database/bcrypt access are added separately in lib/auth.ts, which only
 * runs in the Node.js runtime (API routes, server components, actions).
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // Sign-in failures (e.g. a blocked Google account) come back to the
    // login page as /login?error=..., where we show a friendly message.
    error: "/login",
  },
  providers: [], // populated in lib/auth.ts
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "customer" | "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;