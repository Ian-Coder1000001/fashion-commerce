import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { claimAnonymousCartForCurrentUser } from "@/services/cart.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Same step the email/password login does. This has to happen here,
  // in a route handler, because a page can't delete the guest cart cookie.
  await claimAnonymousCartForCurrentUser();

  const next = request.nextUrl.searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;

  const destination =
    safeNext ?? (session.user.role === "admin" ? "/admin" : "/account");

  return NextResponse.redirect(new URL(destination, request.url));
}