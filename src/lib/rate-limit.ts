import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Generous enough that a real customer who mistypes a password twice, or
// sends two contact messages, never gets blocked — tight enough to stop
// a script. Sliding window, not fixed window, so it can't be gamed by
// timing requests right at a window boundary.
export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  prefix: "ratelimit:login",
});

export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:contact",
});

export const couponRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "5 m"),
  prefix: "ratelimit:coupon",
});

/**
 * Vercel sets x-forwarded-for on every request. Falls back to a shared
 * bucket if it's ever missing (e.g. local dev without a proxy in front)
 * rather than throwing — a rate limiter failing open on an edge case is
 * safer than it crashing the feature it's protecting.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}